import { CommandInteractionOptionResolver } from "discord.js";

declare interface CommandOptions {
  name: string;
  description: string;
  options: CommandInteractionOptionResolver[];
  run: Function;
}