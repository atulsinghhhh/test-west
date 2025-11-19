import mongoose,{ Schema } from "mongoose";

const gradeSchema = new Schema({
    gradeName: { type: String, required: true }
},{timestamps: true});

export const Grade = mongoose.model("Grade",gradeSchema);