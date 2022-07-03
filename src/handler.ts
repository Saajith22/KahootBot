import {
  Client,
  BitFieldResolvable,
  IntentsString,
  Collection,
  ApplicationCommandDataResolvable,
} from "discord.js";
import { glob } from "glob";
import { promisify } from "util";
import { CommandOptions } from "..";
const globPromise = promisify(glob);

interface Data {
  intents: BitFieldResolvable<IntentsString, number>;
}

export default class ExtendedClient extends Client {
  public commands: Collection<string, CommandOptions>;
  constructor({ intents }: Data) {
    super({
      intents,
    });

    this.loadEvents();
    this.loadCommands();
    this.commands = new Collection();
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
    const slashCommands: Array<ApplicationCommandDataResolvable> = [];
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
    });

    globPromise("out/commands/*/*/*.js").then((files) => {
      const subCommand: any = {
        name: null,
        description: null,
        type: "SUB_COMMAND",
      };

      const options = files.map((cmd) => {
        const cmdName = cmd.split("/")[3];
        const file = require(`./${cmd.replace("out/", "")}`);
        const { name, description, options, type } = file.default;

        if (!subCommand.name) subCommand.name = cmdName;
        if (!subCommand.description)
          subCommand.description = `${cmdName} system!`;

        this.commands.set(name, file.default);

        return {
          name,
          description,
          options,
          type,
        };
      });

      slashCommands.push({
        ...subCommand,
        options,
      });

      this.on("ready", async () => {
        await this.guilds.cache
          .get(process.env.guildID)
          .commands.set(slashCommands);

        console.log("Sub-Commands loaded!!".yellow);
      });
    });

    this.on("ready", async () => {
      await this.guilds.cache
        .get(process.env.guildID)
        .commands.set(slashCommands);

      console.log("Slash commands loaded!!".green);
    });
  }
}
