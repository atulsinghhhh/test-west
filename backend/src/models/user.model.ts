import mongoose,{ Schema } from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new Schema({
    name: { type: String, required: true},
    email: { type: String, unique: true, required: true, lowercase: true,
        match: [/.+\@.+\..+/, "Please enter a valid email address"]
    },
    password: { type: String, required: true},
    institutionName: { type: String, default: null},
    role: { type: String, enum: ['student','teacher'], default: 'student', required: true },
    mode: { type: String, enum: ["college", "individual"], required: true }
},{timestamps: true});

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password,10);
    next();
});


export const User = mongoose.model("User",userSchema);