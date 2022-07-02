import {
  Client,
  BitFieldResolvable,
  IntentsString,
  ApplicationCommandData,
  Collection,
} from "discord.js";
import { glob } from "glob";
import { promisify } from "util";
const globPromise = promisify(glob);

interface Data {
  intents: BitFieldResolvable<IntentsString, number>;
}

export default class ExtendedClient extends Client {
  public commands: Collection<unknown, unknown>;
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
    const slashCommands: Array<ApplicationCommandData> = [];
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
