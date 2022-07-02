"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../index"));
index_1.default.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        const command = index_1.default.commands.get(interaction.commandName);
        if (!command)
            return await interaction.reply({
                content: "There was some problem running the command! Please try again later.",
                ephemeral: true,
            });
        await command.run(index_1.default, interaction, interaction.options);
    }
});
