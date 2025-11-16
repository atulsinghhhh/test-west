import mongoose,{ mongo, Schema} from "mongoose";

const chapterSchema = new Schema({
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    chapterName: { type: String, required: true }
},{timestamps: true});

export const Chapter = mongoose.model("Chapter",chapterSchema);