import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const teacherSchema = new Schema({
    name: { type: String, requried: true },
    email: {
        type: String, unique: true, required: true, lowercase: true,
        match: [/.+\@.+\..+/, "Please enter a valid email address"]
    },
    password: { type: String, required: true },
    grade: { type: String },
    gradeId: { type: mongoose.Schema.Types.ObjectId, ref: "Grade", required: true },
    gradeName: { type: String, required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    questionSchoolLimit: { type: Number  },
    paperSchoolLimit: { type: Number},
    paperSchoolCount: { type: Number, default: 0 },
    questionSchoolCount: { type: Number, default: 0 },

}, { timestamps: true })

teacherSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


export const Teacher = mongoose.model("Teacher", teacherSchema);