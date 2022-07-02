"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const tutorials_1 = __importDefault(require("../../data/tutorials"));
const path_1 = __importDefault(require("path"));
const Command = {
    name: "tutorial",
    description: "A simple tutorial to understand the basics!",
    options: [],
    run: async (client, interation, options) => {
        const attach = new discord_js_1.MessageAttachment(path_1.default.join(__dirname, "..", "..", "..", "images", "Kahoot-Book.png"), "book.png");
        const embeds = tutorials_1.default.map((tutorial) => {
            const embed = new discord_js_1.MessageEmbed()
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
exports.default = Command;
