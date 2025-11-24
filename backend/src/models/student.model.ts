import mongoose,{ Schema } from "mongoose";
import bcrypt from "bcryptjs";

const studentSchema =  new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true,
        match: [/.+\@.+\..+/, "Please enter a valid email address"]
    },
    password: { type: String, required: true},
    grade: { type: String, required: true },
    gradeId: { type: mongoose.Schema.Types.ObjectId, ref: "Grade" },
    section: { type: String },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School"},
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher"},

},{timestamps: true})

studentSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password,10);
    next();
});


export const Student = mongoose.model("Student",studentSchema);