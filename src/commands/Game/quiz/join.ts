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
  name: "join",
  description: "Join a quiz using the code!",
  type: "SUB_COMMAND",
  options: [
    {
      name: "code",
      description: "The code for the quiz.",
      required: true,
      type: "STRING",
    },
  ],
  run: async (
    client: ExtendedClient,
    interaction: CommandInteraction,
    options: CommandInteractionOptionResolver
  ) => {
    const code = options.getString("code");

    const data = await db.findOne({
      guild: interaction.guild.id,
    });

    if (!data)
      return interaction.reply({
        content:
          "Oops!! Seems like theres no quizzes created on this server :(",
        ephemeral: true,
      });

    const quizzes = data.live;
    const quiz = quizzes.find((q) => q.code === code);

    quiz.members.push(interaction.member as GuildMember);
    data.save();

    await interaction.reply("You have successfully joined the quiz!!");
  },
};

export default Command;
