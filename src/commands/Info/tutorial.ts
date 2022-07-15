import {
  CommandInteraction,
  CommandInteractionOptionResolver,
  MessageEmbed,
} from "discord.js";

import { CommandOptions } from "../../..";
import tutorials from "../../data/tutorials";
import ExtendedClient from "../../handler";

const Command: CommandOptions = {
  name: "tutorial",
  description: "A simple tutorial to understand the basics!",
  options: [],
  run: async (
    client: ExtendedClient,
    interation: CommandInteraction,
    options: CommandInteractionOptionResolver
  ) => {
    const attach = client.img;

    const embeds = tutorials.map((tutorial) => {
      const embed = new MessageEmbed()
        .setTitle(tutorial.name)
        .setDescription(tutorial.description)
        .setThumbnail(`attachment://${attach.name}`)
        .setColor("PURPLE");

      return embed;
    });

    await interation.reply({
      embeds,
      files: [attach],
    });
  },
};

export default Command;
