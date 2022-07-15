import {
  CommandInteraction,
  CommandInteractionOptionResolver,
  MessageEmbed,
} from "discord.js";

import { CommandOptions } from "../../../..";
import ExtendedClient from "../../../handler";
import db from "../../../models/quiz";

const Command: CommandOptions = {
  name: "list",
  description: "Shows all the available quizzes in the server!!",
  type: "SUB_COMMAND",
  options: [],
  run: async (
    client: ExtendedClient,
    interaction: CommandInteraction,
    options: CommandInteractionOptionResolver
  ) => {
    const data = await db.findOne({
      guild: interaction.guild.id,
    });

    if (!data)
      return interaction.reply({
        content:
          "Opps!! Seems like theres no quizzes created on this server :(",
        ephemeral: true,
      });

    const quizzes = data.quizzes.slice(0, 10);
    const quizEmbed = new MessageEmbed()
      .setTitle("Quizzes")
      .setColor("PURPLE")
      .setThumbnail(`attachment://${client.img.name}`)
      .setDescription(
        quizzes
          .map((q) => {
            return `» **${q.name}** | By: ${client.users.cache.get(
              q.creator
            )}\n\`Code: ${q.code}\``;
          })
          .join("\n")
      );

    return interaction.reply({
      embeds: [quizEmbed],
      files: [client.img],
    });
  },
};

export default Command;
