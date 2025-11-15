import mongoose,{ Schema } from "mongoose";

const gradeSchema = new Schema({
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },
    gradeName: { type: String, required: true }
},{timestamps: true});

export const Grade = mongoose.model("Grade",gradeSchema);