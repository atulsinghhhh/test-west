
import type { Request,Response } from "express";
import type { RequestWithUser } from "./user.controller"
import { School } from "../models/School.model";
import { User } from "../models/user.model";

export const createSchool = async(req: RequestWithUser,res: Response)=>{
    try {
        const adminId = req.user?._id;
        const { name, email,password, questionAdminLimit,paperAdminLimit } = req.body;
    
        if(!name || !email || !password || !questionAdminLimit || !paperAdminLimit){
            return res.status(400).json({ success: false,message: "all fields should be required!"});
        }

        const newSchool = await School.create({
            name,
            email,
            password,
            questionAdminLimit,
            paperAdminLimit,
            admin: adminId
        });
        if(!newSchool){
            return res.status(400).json({success: false,message: "failed to created the school"});
        }

        await User.findByIdAndUpdate(adminId,{
            $push: {school: newSchool._id}
        })
        //  TODO: ADDED FOR REMAINING PAPER AND QUESTION

        res.status(200).json({Success: true,message: "successfully created a new school",newSchool});
    } catch (error) {
        console.log("Error Occuring due to: ",error);
        return res.status(500).json({Success: false,message: "Internal server issue"});
    }
}

export const getSchool = async (req: RequestWithUser,res: Response)=>{
    try {
        const adminId = req.user?._id;
        
        const admin = await User.findById(adminId).populate('school');
        if(!admin){
            return res.status(404).json({success: false,message: "Admin not found"});
        }

        res.status(200).json({success: true,message: "fetch school that created by admin",school: admin.school})
    } catch (error) {
        console.log("Error Occuring due to: ",error);
        return res.status(500).json({Success: false,message: "Internal server issue"});
    }
}
