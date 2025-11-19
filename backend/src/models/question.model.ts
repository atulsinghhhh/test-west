import mongoose, { Schema } from "mongoose";

const questionSchema = new Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    gradeId: { type: mongoose.Schema.Types.ObjectId, ref: "Grade", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
    subtopicId: { type: mongoose.Schema.Types.ObjectId, ref: "Subtopic", required: true },

    questiontext: { type: String, required: true },
    questionType: { type: String, enum: ['short', 'long', 'nat', 'mcq', 'msq'], required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    noofQuestions: { type: Number, default: 1 },
    options: [{ type: String }],
    correctAnswer: { type: String },
    aiUsed: { type: Boolean, default: false }
}, { timestamps: true })

export const Question = mongoose.model("Question", questionSchema);