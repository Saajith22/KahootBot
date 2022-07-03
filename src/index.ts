import ExtendedClient from "./handler";
import "dotenv/config";
import "colors";
import mongoose from "mongoose";

const client = new ExtendedClient({
  intents: ["GUILDS", "GUILD_MEMBERS"],
});

export default client;

mongoose
  .connect(process.env.mongo)
  .then(() => console.log("Connected to DB!!".bgGreen));

client.start();
