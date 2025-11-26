import { Grade } from "../models/grade.model";
import { School } from "../models/School.model";
import { Student } from "../models/student.model";
import { Teacher } from "../models/teacher.model";
import { RequestWithUser } from "./user.controller";
import type { Response } from "express";


export const studentCreatedBySchool = async(req: RequestWithUser, res: Response)=>{
    try {
        const schoolId = req.user?._id;
        const { name,email,password,section, gradeId } = req.body;
        if(!name || !email || !password || !gradeId){
            return res.status(401).json({success: false,message: "all fields are required"});
        }

        const grade = await Grade.findOne({_id: gradeId,schoolId});
        if(!grade){
            return res.status(404).json({ success: false, message: "grade not found for this school" });
        }

        const newStudent = await Student.create({
            name,
            email,
            password,
            gradeId: grade._id,
            grade: grade.gradeName,
            section
        });
        if(!newStudent){
            return res.status(400).json({ success: false, message: "failed to created the new Student" });
        }

        await School.findByIdAndUpdate(schoolId, {
            $push: { teachers: newStudent._id }
        })
        
        res.status(200).json({success: true,message: "successfully created a new student"})

    } catch (error) { 
        console.log("Error Occuring due to: ", error);
        return res.status(500).json({ Success: false, message: "Internal server issue" });
    }
}

export const studentCreatedByTeacher = async(req: RequestWithUser,res: Response)=>{
    try {
        const teacherId = req.user?._id;
        const {name,email,password,section,gradeId} = req.body;
        if(!name || !email || !password || !gradeId){
            return res.status(401).json({success: false,message: "all fields are required"});
        }

        const grade = await Grade.findOne({_id: gradeId,teacherId});
        if(!grade){
            return res.status(404).json({ success: false, message: "grade not found for this school" });
        }

        const newStudent = await Student.create({
            name,
            email,
            password,
            gradeId: grade._id,
            grade: grade.gradeName,
            section,
            teacherId
        });
        if(!newStudent){
            return res.status(400).json({ success: false, message: "failed to created the new Student" });
        }

        await Teacher.findByIdAndUpdate(teacherId, {
            $push: { students: newStudent._id }
        });
        
        res.status(200).json({success: true,message: "successfully created a new student"});
    } catch (error) {
        console.log("Error Occuring due to: ", error);
        return res.status(500).json({ Success: false, message: "Internal server issue" });
    }
}