import ExtendedClient from "./handler";
import "dotenv/config";
import "colors";
import mongoose from "mongoose";
import { MessageAttachment } from "discord.js";
import path from "path";

const client = new ExtendedClient({
  intents: ["GUILDS", "GUILD_MEMBERS"],
});

client.img = new MessageAttachment(
  path.join(__dirname, "..", "images", "Kahoot-Book.png"),
  "book.png"
);
export default client;

mongoose
  .connect(process.env.mongo)
  .then(() => console.log("Connected to DB!!".bgGreen));

client.start();
