import { ApplicationCommandOptionData } from "discord.js";

declare interface CommandOptions {
  name: string;
  description: string;
  options: ApplicationCommandOptionData[];
  type?: string;
  run: Function;
}