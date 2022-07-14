import { MessageEmbed } from "discord.js";
import { CommandOptions } from "../..";
import client from "../index";
import db from "../models/quiz";

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    const name = interaction.options.getSubcommand()
      ? interaction.options.getSubcommand()
      : interaction.commandName;

    const command: CommandOptions = client.commands.get(name);

    if (!command)
      return await interaction.reply({
        content:
          "There was some problem running the command! Please try again later.",
        ephemeral: true,
      });

    await command.run(client, interaction, interaction.options);
  }
});
