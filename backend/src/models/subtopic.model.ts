import mongoose,{ Schema } from "mongoose";

const subtopicSchema = new Schema({
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true },
    subtopicName: { type: String, required: true }
},{timestamps: true})

export const Subtopic = mongoose.model("Subtopic", subtopicSchema);
