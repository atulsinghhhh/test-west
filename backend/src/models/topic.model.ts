import mongoose,{ Schema} from "mongoose";

const topicSchema = new Schema({
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
    topicName: { type: String, required: true }
},{timestamps: true})

export const Topic = mongoose.model("Topic",topicSchema);