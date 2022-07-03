"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../index"));
index_1.default.on("ready", () => {
    console.log(`${index_1.default.user.username} is now ready to play!!`.magenta);
});
