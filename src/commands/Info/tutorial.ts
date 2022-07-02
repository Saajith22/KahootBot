import {
  Client,
  CommandInteraction,
  CommandInteractionOptionResolver,
  MessageAttachment,
  MessageEmbed,
} from "discord.js";

import { CommandOptions } from "../../..";
import tutorials from "../../data/tutorials";
import path from "path";

const Command: CommandOptions = {
  name: "tutorial",
  description: "A simple tutorial to understand the basics!",
  options: [],
  run: async (
    client: Client,
    interation: CommandInteraction,
    options: CommandInteractionOptionResolver
  ) => {
    const attach = new MessageAttachment(
      path.join(__dirname, "..", "..", "..", "images", "Kahoot-Book.png"),
      "book.png"
    );

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
