import {
    Client,
    CommandInteraction,
    CommandInteractionOptionResolver,
    MessageAttachment,
    MessageEmbed,
  } from "discord.js";
  
  import { CommandOptions } from "../../../..";
  
  const Command: CommandOptions = {
    name: "create",
    description: "Create a custom quiz for others to play!!",
    type: "SUB_COMMAND",
    options: [
      {
        name: "name",
        type: "STRING",
        description: "Name of the quiz.",
      },
    ],
    run: async (
      client: Client,
      interation: CommandInteraction,
      options: CommandInteractionOptionResolver
    ) => {},
  };
  
  export default Command;
  