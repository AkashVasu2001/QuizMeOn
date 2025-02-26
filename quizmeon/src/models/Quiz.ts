import mongoose, { Schema, Document } from "mongoose";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface IQuiz extends Document {
  title: string;
  difficulty: "Easy" | "Intermediate" | "Hard";
  questions: Question[];
}

const QuizSchema = new Schema<IQuiz>({
  title: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Intermediate", "Hard"], required: true },
  questions: [
    {
      question: { type: String, required: true },
      options: { type: [String], required: true },
      correctAnswer: { type: String, required: true },
    },
  ],
});

export default mongoose.models.Quiz || mongoose.model<IQuiz>("Quiz", QuizSchema);
