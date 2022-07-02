"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handler_1 = __importDefault(require("./handler"));
require("dotenv/config");
require("colors");
const client = new handler_1.default({
    intents: ["GUILDS", "GUILD_MEMBERS"],
});
exports.default = client;
client.start();
