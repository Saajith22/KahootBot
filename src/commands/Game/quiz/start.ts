import {
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
  MessageEmbed,
} from "discord.js";

import { CommandOptions } from "../../../..";
import ExtendedClient from "../../../handler";
import db from "../../../models/quiz";

const Command: CommandOptions = {
  name: "start",
  description: "Start a quiz!",
  type: "SUB_COMMAND",
  options: [
    {
      name: "id",
      description: "The id of the quiz.",
      required: true,
      type: "STRING",
    },
  ],
  run: async (
    client: ExtendedClient,
    interaction: CommandInteraction,
    options: CommandInteractionOptionResolver
  ) => {
    const id = options.getString("id");

    const data = await db.findOne({
      guild: interaction.guild.id,
    });

    const liveCheck = data.live.find((l) => l.creator === interaction.user.id);
    if (liveCheck)
      return interaction.reply({
        content:
          "Oops!! Seems like you already have started another quiz, end it before you start another one!",
        ephemeral: true,
      });

    if (!data)
      return interaction.reply({
        content:
          "Oops!! There are `0` available quizzess, try creating one by using `/create`!",
        ephemeral: true,
      });

    const quizzes = data.quizzes;
    const quiz = quizzes.find((q) => q.id === id);

    if (!quiz.public && quiz.creator != interaction.user.id)
      return interaction.reply({
        content: "Oops!! Seems like this quiz is a private one.",
        ephemeral: true,
      });

    const liveData = {
      creator: interaction.user.id,
      members: [] as GuildMember[],
      code: createCode(),
    };

    data.live.push(liveData);
    data.save();

    const embed = new MessageEmbed()
      .setTitle(`A quiz has been started by user ${interaction.user.tag}`)
      .setColor("PURPLE")
      .setDescription(`Use code \`${liveData.code}\` to join!!`)
      .addFields([
        {
          name: "Quiz Details:",
          value: `Name: \`${
            quiz.name
          }\`\nAuthor: ${interaction.guild.members.cache.get(
            quiz.creator
          )}\nThere are totally \`${quiz.questions.length}\` questions!`,
        },
      ]);

    await interaction.reply({
      embeds: [embed],
    });
  },
};

function createCode() {
  let str = "";
  for (let i = 0; i < 8; i++) {
    str += Math.floor(Math.random() * 10);
  }

  return str;
}

export default Command;
