import { CommandOptions } from "../..";
import client from "../index";

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    const command: CommandOptions = client.commands.get(
      interaction.commandName
    ) as CommandOptions;

    if (!command)
      return await interaction.reply({
        content:
          "There was some problem running the command! Please try again later.",
        ephemeral: true,
      });

    await command.run(client, interaction, interaction.options);
  }
});
