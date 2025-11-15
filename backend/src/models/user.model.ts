import mongoose,{ Schema } from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new Schema({
    name: { type: String, required: true},
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true, required: true, lowercase: true,
        match: [/.+\@.+\..+/, "Please enter a valid email address"]
    },
    password: { type: String, required: true},
    // role: { type: String, enum: ['student','teacher','admin'], default: 'admin', required: true },
    school:[{ type: mongoose.Schema.Types.ObjectId, ref: "School"}],
},{timestamps: true});

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password,10);
    next();
});


export const User = mongoose.model("User",userSchema);