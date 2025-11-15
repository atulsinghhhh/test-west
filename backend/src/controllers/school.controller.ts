import type { Request,Response } from "express";
import { School } from "../models/School.model.js";
import { Teacher } from "../models/teacher.model.js";
import type { RequestWithUser } from "./user.controller.js"

export const addTeachers = async(req: RequestWithUser, res: Response)=>{
    try {
        const schoolId = req.user?._id;
        const { name, email, password, grade,questionSchoolLimit,paperSchoolLimit} = req.body;
        if(!name || !email || !password || !grade || !paperSchoolLimit || !questionSchoolLimit){
            return res.status(400).json({success: false, message: "all fields are required"});
        }

        const newTeacher=await Teacher.create({
            name,
            email,
            password,
            grade,
            questionSchoolLimit,
            paperSchoolLimit,
            school: schoolId,

            questionSchoolCount: 0,
            paperSchoolCount: 0
        })
        if(!newTeacher){
            return res.status(400).json({success: false,message: "failed to created the new School"});
        }

        await School.findByIdAndUpdate(schoolId,{
            $push: {teachers: newTeacher._id}
        })

        const remainingQuestions = newTeacher.questionSchoolLimit - newTeacher.questionSchoolCount;
        const remainingPapers = newTeacher.paperSchoolLimit - newTeacher.paperSchoolCount;

        res.status(200).json({success: true,message: "successfully created new teacher",
            teacher :{
                _id: newTeacher._id,
                name: newTeacher.name,
                email: newTeacher.email,
                grade: newTeacher.grade,
                school: schoolId,

                questionLimit: newTeacher.questionSchoolLimit,
                paperLimit: newTeacher.paperSchoolLimit,

                questionCount: newTeacher.questionSchoolCount,
                paperCount: newTeacher.paperSchoolCount,

                remainingQuestions,
                remainingPapers
            }
        });
    } catch (error) {
        console.log("Error Occuring due to: ",error);
        return res.status(500).json({Success: false,message: "Internal server issue"});
    }
}

export const getTeacher = async(req: RequestWithUser,res: Response)=>{
    try {
        const schoolId = req.user?._id;
        console.log("SchoolId: ",schoolId);

        const school = await School.findById(schoolId).populate("teachers");
        if(!school){
            return res.status(404).json({success: false,message: "school not found"})
        }

        res.status(200).json({success: true,message: "fetch school that created by admin",teachers: school.teachers});
    } catch (error) {
        console.log("Error Occuring due to: ",error);
        return res.status(500).json({Success: false,message: "Internal server issue"});
    }
}

