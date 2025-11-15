import mongoose,{ Schema } from "mongoose";

const teacherSchema = new Schema({
    name: { type: String, requried: true },
    email: { type: String, unique: true, required: true, lowercase: true,
        match: [/.+\@.+\..+/, "Please enter a valid email address"]
    },
    password: { type: String, required: true},
    grade: { type: String, enum: ['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7',
        'Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'
    ]},
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School"},
    questionSchoolLimit: { type: Number, required: true },
    paperSchoolLimit: { type: Number, required: true },
    paperSchoolCount: { type: Number, default: 0 },
    questionSchoolCount: { type: Number, default: 0 },
    
},{timestamps: true})

export const Teacher = mongoose.model("Teacher",teacherSchema);