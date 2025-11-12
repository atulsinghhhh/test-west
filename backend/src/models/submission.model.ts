import mongoose,{ Schema } from "mongoose";

const submissionSchema = new Schema({
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "TestSeries" },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    SubmissionAt: { type: Date, default: Date.now()},
    answers: [
        {
            answer: String,
            isCorrect: Boolean,
            questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Test.questions"},
            markObtained: { type: Number, default: 0}
        }
    ],
    score: { type: Number, default: 0}

},{timestamps: true});

submissionSchema.pre("save",function (next){
    this.score = this.answers.reduce((sum,ans)=> sum+ans.markObtained, 0);
    next();
})

export const Submission = mongoose.model("Submission",submissionSchema);