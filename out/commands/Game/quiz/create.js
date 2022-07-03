"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command = {
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
    run: async (client, interation, options) => { },
};
exports.default = Command;
