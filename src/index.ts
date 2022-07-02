import ExtendedClient from "./handler";
import "dotenv/config";
import "colors";

const client = new ExtendedClient({
  intents: ["GUILDS", "GUILD_MEMBERS"],
});

export default client;

client.start();
