import {
  Client,
  CommandInteraction,
  CommandInteractionOptionResolver,
  Message,
  MessageActionRow,
  MessageAttachment,
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
    interation: CommandInteraction,
    options: CommandInteractionOptionResolver
  ) => {
    const data = await db.findOne({
      guild: interation.guild.id,
    });

    const quizName = options.getString("name");

    const quiz: Quiz = {
      name: quizName || "Kahoot-Quiz",
      questions: [],
    };

    const quizDetails = [`**Name:** \`${quiz.name}\``];

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
          value: `**\`${quiz.questions.length}\`**`,
        },
      ])
      .setColor("PURPLE");

    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("create-menu")
        .setOptions([
          {
            label: "Add question",
            value: "question",
          },
        ])
        .setPlaceholder("Choose an operation")
    );

    const msg: Message = (await interation.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true,
    })) as Message;

    const collector = msg.createMessageComponentCollector({
      filter: async (i) => {
        if (interation.user.id === i.user.id) return true;
        return void (await interation.followUp({
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

          const modal = await makeModal(
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
            ]
          );

          await i.showModal(modal);
          break;
      }
    });
  },
};

export default Command;
