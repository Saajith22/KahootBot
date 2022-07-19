import {
  CommandInteraction,
  CommandInteractionOptionResolver,
  Message,
  MessageActionRow,
  MessageEmbed,
  MessageSelectMenu,
  TextInputComponent,
} from "discord.js";

import { CommandOptions, Quiz } from "../../../..";
import { makeModal } from "../../../functions/api";
import { createBoard } from "../../../functions/canvas";
import ExtendedClient from "../../../handler";
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
      required: true,
    },
    {
      name: "public",
      type: "BOOLEAN",
      description: "Whether the quiz should be public or not.",
      required: true,
    },
  ],
  run: async (
    client: ExtendedClient,
    interaction: CommandInteraction,
    options: CommandInteractionOptionResolver
  ) => {
    const quizName = options.getString("name");
    const isPublic = options.getBoolean("public");

    const quiz: Quiz = {
      name: quizName || `Kahoot-Quiz-${Math.floor(Math.random() * 100000)}`,
      questions: [],
      id: createId(),
      public: isPublic,
      creator: interaction.user.id,
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
      idle: 1000 * 60 * 10,
      componentType: "SELECT_MENU",
    });

    const updateQuestions = async () => {
      let newEmbed = msg.embeds[0];
      newEmbed.fields[1].value = `There are totally \`${quiz.questions.length}\` questions!`;
      await msg.edit({
        embeds: [newEmbed],
      });
    };

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

          await updateQuestions();

          break;

        case "delete":
          collector.options.max++;

          const deleteModal = await makeModal(
            "Delete a question",
            "delete-modal",
            [
              new MessageActionRow<TextInputComponent>().addComponents(
                new TextInputComponent()
                  .setCustomId("number")
                  .setStyle("SHORT")
                  .setLabel("Question number")
                  .setPlaceholder("Type the question number to delete...")
              ),
            ]
          );

          await i.showModal(deleteModal);

          const deleteSumbit = await i.awaitModalSubmit({
            time: 60000 * 5,
            filter: async (m) => m.customId === "delete-modal",
          });

          const questionNumber =
            deleteSumbit.fields.getTextInputValue("number");
          const parsedNumber = parseInt(questionNumber);

          if (isNaN(parsedNumber))
            return deleteSumbit.reply({
              content: "The question number has to be a number!!",
              ephemeral: true,
            });

          const providedQuestion = quiz.questions[parsedNumber - 1];
          if (!providedQuestion)
            return deleteSumbit.reply({
              content: "Thats an invalid question number!!",
              ephemeral: true,
            });

          quiz.questions.splice(parsedNumber - 1, 1);

          await deleteSumbit.reply({
            content: `The question has been deleted successfully!!`,
            ephemeral: true,
          });

          await updateQuestions();

          break;

        case "finish":
          const data = await db.findOne({
            guild: interaction.guild.id,
          });

          if (!data) {
            await db.create({
              guild: interaction.guild.id,
              quizzes: [quiz],
              live: [],
            });
          } else {
            data.quizzes.push(quiz);
            data.save();
          }

          await msg.edit({
            embeds: [
              new MessageEmbed()
                .setAuthor({
                  name: `${quiz.name} | By: ${interaction.user.username}`,
                })
                .setThumbnail(`attachment://${client.img.name}`)
                .setColor("PURPLE")
                .setDescription(
                  `**Quiz Details:**\n**\`ID:\`** \`${quiz.id}\`\n**\`Number Of Questions:\`** \`${quiz.questions.length}\``
                ),
            ],
            components: [],
            files: [client.img],
          });

          await i.reply({
            content: `The quiz has been successfully created!!`,
            ephemeral: true,
          });

          break;
      }
    });

    collector.on("end", async (i, r) => {
      if (r === "time" || r === "idle") {
        return await interaction.reply({
          content:
            "Seems like you ran out of time! Don't worry, your work is saved as a draft, continue by using `/drafts`!",
          ephemeral: true,
        });
      }
    });
  },
};

function createId() {
  const n = 12;
  let str = "";
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuwxyz1234567890-_";
  for (let i = 0; i < n; i++) {
    const randomNumber = Math.floor(Math.random() * chars.length);
    str += chars[randomNumber];
  }

  return str;
}

export default Command;
