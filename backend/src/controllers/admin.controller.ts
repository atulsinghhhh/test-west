
import type { Request,Response } from "express";
import type { RequestWithUser } from "./user.controller.js"
import { School } from "../models/School.model.js";
import { User } from "../models/user.model.js";

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
        const remainingQuestions = newSchool.questionAdminLimit - newSchool.questionAdminCount;
        const remainingPapers = newSchool.paperAdminLimit - newSchool.paperAdminCount;

        res.status(200).json({Success: true,message: "successfully created a new school",school: {
            _id: newSchool._id,
            name: newSchool.name,
            email: newSchool.email,

            questionLimit: newSchool.questionAdminLimit,
            paperLimit: newSchool.paperAdminLimit,
            questionCount: newSchool.questionAdminCount,
            paperCount: newSchool.paperAdminCount,

            remainingPapers,
            remainingQuestions
        }});
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

export const getadminstats = async (req: RequestWithUser,res: Response)=>{
    try {
        const adminId = req.user?._id;

        const schools = await School.find({ admin: adminId })
            .select("name email questionAdminLimit paperAdminLimit questionAdminCount paperAdminCount teachers createdAt");
        if(!schools){
            return res.status(404).json({success: false, message: "schools are not found"});
        }
        // console.log("school: ",schools);

        const stats = schools.map(school => {
            const remainingQuestions = school.questionAdminLimit - school.questionAdminCount;
            const remainingPapers = school.paperAdminLimit - school.paperAdminCount;

            return {
                _id: school._id,
                name: school.name,
                email: school.email,

                questionLimit: school.questionAdminLimit,
                paperLimit: school.paperAdminLimit,

                questionCount: school.questionAdminCount,
                paperCount: school.paperAdminCount,

                remainingQuestions,
                remainingPapers,
            };
        });

        const totalSchools = schools.length;
        const totalTeachers = schools.reduce((sum, s) => sum + (s.teachers?.length || 0), 0);

        const totalQuestionLimit = schools.reduce((sum, s) => sum + s.questionAdminLimit, 0);
        const totalQuestionCount = schools.reduce((sum, s) => sum + s.questionAdminCount, 0);

        const totalPaperLimit = schools.reduce((sum, s) => sum + s.paperAdminLimit, 0);
        const totalPaperCount = schools.reduce((sum, s) => sum + s.paperAdminCount, 0);

        return res.status(200).json({
            success: true,
            totalSchools,
            totalTeachers,
            totalUsage: {
                totalQuestionLimit,
                totalQuestionCount,
                totalQuestionRemaining: totalQuestionLimit - totalQuestionCount,

                totalPaperLimit,
                totalPaperCount,
                totalPaperRemaining: totalPaperLimit - totalPaperCount,
            },
            schools: stats
        });

    } catch (error) {
        console.error("Error Occurring: ", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}
