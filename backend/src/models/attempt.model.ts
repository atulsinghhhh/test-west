import mongoose, { Schema } from "mongoose";

const attemptSchema = new Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    paperId: { type: mongoose.Schema.Types.ObjectId, ref: "Paper" }, 
    batchId: { type: String }, // For Question batches
    
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    gradeId: { type: mongoose.Schema.Types.ObjectId, ref: "Grade" },
    
    answers: [{
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        questionText: { type: String }, // Snapshot in case question changes
        userAnswer: { type: Schema.Types.Mixed }, // String or Array for MCQs
        correctAnswer: { type: Schema.Types.Mixed },
        isCorrect: { type: Boolean },
        marks: { type: Number, default: 0 }
    }],
    
    totalMarks: { type: Number, required: true },
    obtainedMarks: { type: Number, required: true },
    percentage: { type: Number },
    
    status: { type: String, enum: ["in-progress", "completed"], default: "in-progress" },
    feedback: { type: String },
    
    timeTaken: { type: Number }, 
}, { timestamps: true });

export const Attempt = mongoose.model("Attempt", attemptSchema);
