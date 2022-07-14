import {
  Client,
  CommandInteraction,
  CommandInteractionOptionResolver,
  Message,
  MessageActionRow,
  MessageAttachment,
  MessageButton,
  MessageEmbed,
  MessageSelectMenu,
  TextInputComponent,
} from "discord.js";

import { CommandOptions, Quiz } from "../../../..";
import { makeModal } from "../../../functions/api";
import { createBoard } from "../../../functions/canvas";
import db from "../../../models/quiz";

const Command: CommandOptions = {
  name: "create",
  description: "Create a custom quiz for others to play!!",
  type: "SUB_COMMAND",
  options: [
    {
      name: "name",
      type: "STRING",
      description: "Name of the quiz.",
    },
  ],
  run: async (
    client: Client,
    interaction: CommandInteraction,
    options: CommandInteractionOptionResolver
  ) => {
    const quizName = options.getString("name");

    const quiz: Quiz = {
      name: quizName || `Kahoot-Quiz-${Math.floor(Math.random() * 100000)}`,
      questions: [],
    };

    const quizDetails = [`**Quiz Name:** \`${quiz.name}\``];

    const embed = new MessageEmbed()
      .setTitle("Create a quiz")
      .setDescription("Use the menu below to create a quiz!")
      .addFields([
        {
          name: "Basic Quiz Details:",
          value: quizDetails.join("\n"),
        },
        {
          name: "Amount Of Questions:",
          value: `There are totally \`${quiz.questions.length}\` questions!`,
        },
      ])
      .setColor("PURPLE");

    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("create-menu")
        .setOptions([
          {
            label: "Add a question",
            value: "question",
          },
          {
            label: "Delete a question",
            value: "delete",
          },
          {
            label: "Finish Process",
            value: "finish",
          },
        ])
        .setPlaceholder("Choose an operation")
    );

    const msg = (await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true,
    })) as Message;

    const collector = msg.createMessageComponentCollector({
      filter: async (i) => {
        if (interaction.user.id === i.user.id) return true;
        return void (await interaction.followUp({
          content: "You can not use this interaction!!",
          ephemeral: true,
        }));
      },
      max: 1,
      componentType: "SELECT_MENU",
    });

    collector.on("collect", async (i) => {
      const value = i.values[0];

      switch (value) {
        case "question":
          collector.options.max++;

          const questionModal = await makeModal(
            `Question: ${quiz.questions.length + 1}`,
            "question-modal",
            [
              new MessageActionRow<TextInputComponent>().setComponents([
                new TextInputComponent()
                  .setLabel("Question")
                  .setPlaceholder("Enter your question..")
                  .setStyle("SHORT")
                  .setCustomId(`text-question`),
              ]),
              new MessageActionRow<TextInputComponent>().setComponents([
                new TextInputComponent()
                  .setLabel("Options (Max: 4 | Min: 2)")
                  .setPlaceholder(
                    "Type in the options...\nExample:\na - apple\nb - banana"
                  )
                  .setStyle("PARAGRAPH")
                  .setCustomId(`text-options`),
              ]),
              new MessageActionRow<TextInputComponent>().setComponents([
                new TextInputComponent()
                  .setLabel("Correct Answer")
                  .setPlaceholder("Type in the correct option (Eg: a)")
                  .setStyle("SHORT")
                  .setCustomId(`text-answer`),
              ]),
            ]
          );

          await i.showModal(questionModal);

          const modal = await i.awaitModalSubmit({
            time: 60000 * 5,
            filter: async (m) => m.customId === "question-modal",
          });

          const textIds = ["text-question", "text-options", "text-answer"];
          const [question, options, answer] = textIds.map((id) =>
            modal.fields.getTextInputValue(id)
          );

          const filteredOptions = options.split("\n").map((f) => {
            let split = f.split("-").map((s) => s.replace(" ", ""));
            return {
              name: split[0],
              value: split[1],
            };
          });

          if (filteredOptions.find((f) => !f.value || !f.name))
            return modal.reply({
              content:
                "Invalid options! Please make sure they are of the format:\n```a - option1\nb - option2```\n\n**Seperate each option with a seperate line!**",
              ephemeral: true,
            });

          if (filteredOptions.length < 2 || filteredOptions.length > 4)
            return modal.reply({
              content:
                "There has to be atleast 2 options, and it can not exceed 4 options!",
              ephemeral: true,
            });

          await modal.reply({
            content: `The question has been added successfully!!`,
            ephemeral: true,
          });

          quiz.questions.push({
            question,
            answer,
            options: filteredOptions,
          });

          console.log(quiz);

          let newEmbed = msg.embeds[0];
          newEmbed.fields[1].value = `There are totally \`${quiz.questions.length}\` questions!`;
          await msg.edit({
            embeds: [newEmbed],
          });

          break;

        case "delete":
          collector.options.max++;
          break;

        case "finish":
          const data = await db.findOne({
            guild: interaction.guild.id,
          });

          if (!data) {
            await db.create({
              guild: interaction.guild.id,
              quizzes: [
                {
                  name: quiz.name,
                  questions: quiz.questions,
                },
              ],
            });
          } else {
            data.quizzes.push({
              name: quiz.name,
              questions: quiz.questions,
            });

            data.save();
          }

          await i.reply({
            content: `The quiz has been successfully created!!`,
            ephemeral: true,
          });

          break;
      }
    });
  },
};

export default Command;
