import mongoose,{ Schema } from "mongoose";

const testSchema = new Schema({
    title: { type: String, required: true},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    subject: { type: String, required: true},
    institution: { type: String },
    duration: { type: Number, required: true },
    isPublished: { type: Boolean, default: false },
    totalMarks: { type: Number, required: true },
    questions: [
        {
            type: {
                type: String,
                enum: ["mcq" , "descriptive"],
                reqired: true
            },
            question: String,
            options: [String],
            correctAnswer: String,
            marks: Number
        }
    ] 

},{timestamps: true});


export const TestSeries = mongoose.model("TestSeries",testSchema);

