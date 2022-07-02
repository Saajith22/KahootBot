"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const glob_1 = require("glob");
const util_1 = require("util");
const globPromise = (0, util_1.promisify)(glob_1.glob);
class ExtendedClient extends discord_js_1.Client {
    commands;
    constructor({ intents }) {
        super({
            intents,
        });
        this.loadEvents();
        this.loadCommands();
        this.commands = new discord_js_1.Collection();
    }
    start() {
        this.login(process.env.token);
    }
    loadEvents() {
        globPromise("out/events/*.js").then((files) => {
            files.forEach((event) => {
                require(`./${event.replace("out/", "")}`);
            });
        });
    }
    loadCommands() {
        const slashCommands = [];
        globPromise("out/commands/*/*.js").then((files) => {
            files.forEach((cmd) => {
                const file = require(`./${cmd.replace("out/", "")}`);
                const { name, description, options } = file.default;
                this.commands.set(name, file.default);
                slashCommands.push({
                    name,
                    description,
                    options,
                });
            });
            this.on("ready", async () => {
                await this.guilds.cache
                    .get(process.env.guildID)
                    .commands.set(slashCommands);
                console.log("Slash commands loaded!!".green);
            });
        });
    }
}
exports.default = ExtendedClient;
