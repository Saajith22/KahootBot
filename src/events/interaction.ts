import { MessageEmbed } from "discord.js";
import { CommandOptions } from "../..";
import client from "../index";

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
  } else if (interaction.isModalSubmit()) {
    const { customId } = interaction;
    switch (customId) {
      case "question-modal":
        const textIds = ["text-question", "text-options"];
        const [question, options] = textIds.map((id) =>
          interaction.fields.getTextInputValue(id)
        );

        const filteredOptions = options.split("\n").map((f) => {
          let split = f.split("-");
          return {
            name: split[0],
            value: split[1],
          };
        });

        if (filteredOptions.find((f) => !f.value || !f.name))
          return interaction.reply({
            content:
              "Invalid options! Please make sure they are of the format:\n```a - option1\nb - option2```\n\n**Seperate each option with a seperate line!**",
            ephemeral: true,
          });

        if (filteredOptions.length < 2 || filteredOptions.length > 4)
          return interaction.reply({
            content:
              "There has to be atleast 2 options, and it can not exceed 4 options!",
            ephemeral: true,
          });

        const initialEmbed = interaction.message.embeds[0];
        let amount = parseInt(initialEmbed.fields[1].value.replace(/\D/g, ""));
        initialEmbed.fields[1] = {
          name: "Amount of questions:",
          value: `**\`${amount + 1}\`**`,
        };

        const embed = new MessageEmbed(initialEmbed);

        await interaction.update({
          embeds: [embed],
        });

        await interaction.reply({
          content: `The question has been added successfully!!`,
          ephemeral: true,
        });

        break;
    }
  }
});
