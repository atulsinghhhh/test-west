import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";


export const userSignup = async (req: Request,res: Response)=>{
    try {
        const { name,email,password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({success: false , message: "all fields are required"});
        }

        const exisitingUser=await User.findOne({email});
        if(exisitingUser){
            return res.status(401).json({success: false, message: "already registered with this email"});
        }

        const user = await User.create({
            name,
            password,
            email
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
            expiresIn: "7d"
        });

        res.status(201).json({ success: true, message: "Signup successful", user });
    } catch (error) {
        console.log("Error occuring while signup a user",error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}


