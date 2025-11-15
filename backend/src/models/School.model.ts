import mongoose,{ Schema } from "mongoose";
import bcrypt from "bcryptjs";

const schoolSchema = new Schema({
    name: { type: String, required: true },
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher"}],
    email: { type: String, required: true, unique: true,
        match: [/.+\@.+\..+/, "Please enter a valid email address"]
    },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    password: { type: String, required: true },
    questionAdminLimit: { type: Number, required: true },
    paperAdminLimit: { type: Number, required: true },
    paperAdminCount: { type: Number, default: 0 },
    questionAdminCount: { type: Number, default: 0 },

},{timestamps: true});

schoolSchema.pre("save", async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password,10);
    next();
})

export const School = mongoose.model("School",schoolSchema); 