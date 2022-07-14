import { ApplicationCommandOptionData } from "discord.js";

declare interface CommandOptions {
  name: string;
  description: string;
  options: ApplicationCommandOptionData[];
  type?: string;
  run: Function;
}

declare type Quiz = {
  name: string;
  questions: {
    question: string;
    answer: string;
    options: {
      name: string;
      value: string;
    }[];
  }[];
};
