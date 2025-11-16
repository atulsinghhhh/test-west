import mongoose,{ Schema } from "mongoose";
import bcrypt from "bcryptjs";

const teacherSchema = new Schema({
    name: { type: String, requried: true },
    email: { type: String, unique: true, required: true, lowercase: true,
        match: [/.+\@.+\..+/, "Please enter a valid email address"]
    },
    password: { type: String, required: true},
    grade: { type: String, enum: ['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7',
        'Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'
    ]},
    students:[{ type: mongoose.Schema.Types.ObjectId, ref: "Student"}],
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School"},
    questionSchoolLimit: { type: Number, required: true },
    paperSchoolLimit: { type: Number, required: true },
    paperSchoolCount: { type: Number, default: 0 },
    questionSchoolCount: { type: Number, default: 0 },
    
},{timestamps: true})

teacherSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password,10);
    next();
});


export const Teacher = mongoose.model("Teacher",teacherSchema);