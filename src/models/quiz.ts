import { GuildMember } from "discord.js";
import { model, Schema} from "mongoose";
import { Quiz } from "../..";

interface QuizModel {
    guild: string;
    quizzes: Quiz[];
    live: {
      creator: string;
      code: string;
      members: GuildMember[];
    }[]
}

export default model<QuizModel>("quiz", new Schema<QuizModel>({
    guild: String,
    quizzes: Array,
    live: Array
}));
