import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const standaloneStudentSchema = new Schema({
    name: { type: String, required: true },
    email: { 
        type: String, 
        required: true,
        unique: true,
        match: [/.+\@.+\..+/, "Please enter a valid email address"]
    },
    password: { type: String, required: true },
    // No gradeId, schoolId, or teacherId for standalone students
    // They can access content based on their own choices/filters later
}, { timestamps: true });

standaloneStudentSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

export const StandaloneStudent = mongoose.model("StandaloneStudent", standaloneStudentSchema);
