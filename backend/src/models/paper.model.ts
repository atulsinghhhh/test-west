import mongoose,{ Schema } from "mongoose";

const paperSchema = new Schema({
    duration: { type: Number, required: true},
    totalQuestion: { type: Number, required: true},
    totalMarks: { type: Number,required: true},
    Instructions: { type: String, required: true},
    paperType: { type: String, enum: ["chapterwise", "subjectwise"], required: true},
    testType: { type: String, required: true},
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher"},
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School"},
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true },
    paperContent: { type: String, required: true}
},{timestamps: true});

export const Paper = mongoose.model("Paper",paperSchema);