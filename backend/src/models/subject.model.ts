import mongoose,{ Schema} from "mongoose";

const subjectSchema = new Schema({
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },
    gradeId: { type: Schema.Types.ObjectId, ref: "Grade", required: true },
    subjectName: { type: String, required: true }
},{timestamps: true});

export const Subject = mongoose.model("Subject",subjectSchema);