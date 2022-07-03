import { model, Schema} from "mongoose";
import { Quiz } from "../..";

interface QuizModel {
    guild: string;
    quizzes: Quiz[]
}

export default model<QuizModel>("quiz", new Schema<QuizModel>({
    guild: String,
    quizzes: Array<Quiz>
}));
