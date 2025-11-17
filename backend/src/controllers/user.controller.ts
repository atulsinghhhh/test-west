import { User } from "../models/user.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { School } from "../models/School.model";
import { Teacher } from "../models/teacher.model";

export interface IUserPayload {
    _id: string;
    name?: string;
    email?: string;
    role?: string;
}

export interface RequestWithUser extends Request {
    user?: IUserPayload;
}

export const AdminSignup = async (req: Request, res: Response) => {
    try {
        const { username,name, email, password } = req.body;
        if (!name || !email || !password || !username) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(401).json({ success: false, message: "Already registered with this email" });
        }

        const user = await User.create({
            name,
            username,
            email,
            password
        });

        const token = jwt.sign({ id: user._id,email: user.email }, process.env.JWT_SECRET!, { expiresIn: "7d" });

        return res.status(201).json({ success: true, message: "Admin has been created ", user });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const userLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        let user: any = null;
        let role: "admin" | "school" | "teacher" | "student" | null = null;
        
        user = await User.findOne({email});
        if(user){ // check for admin
            role = 'admin';
        }

        if(!user){
            user = await School.findOne({email});
            if(user){ // check for school
                role = 'school';
            }
        }

        if(!user){
            user = await Teacher.findOne({email});
            if(user){
                role = 'teacher'
            }
        }

        if(!user){
            return res.status(404).json({success: false,message: "email not registered"})
        }
        

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid password" });
        }

        const token = jwt.sign({ id: user._id, email: user.email,role: role}, process.env.JWT_SECRET!, { expiresIn: "7d" });
        console.log("Token is generated: ",token);

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });


        return res.status(200).json({ success: true, message: "Login successful",user });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const userLogout = async (req: Request, res: Response) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });
        
        return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Logout failed", error });
    }
};

export const getProfile = async (req: RequestWithUser, res: Response) => {
    try {
        const userId = req.user?._id;
        const role = req.user?.role;

        if (!userId || !role) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        let profile: any =null;

        if(role === "admin"){
            profile = await User.findById(userId).select("-password");
        }

        if(role === "school") {
            profile = await School.findById(userId).select("-password");
        }

        if(role === "teacher") {
            profile = await School.findById(userId).select("-password");
        }

        // if(role === "student") {
        //     profile = await School.findById(userId).select("-password");
        // }

        if (!profile) {
            return res.status(404).json({ success: false, message: "Profile not found" });
        }

        res.status(200).json({ success: true, profile });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
