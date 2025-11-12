import { TestSeries } from "../models/test.model.js";
import type { Request,Response } from "express";
import type { RequestWithUser } from "./user.controller.js"

export const createTest = async(req: RequestWithUser, res: Response)=>{
    try {
        const { title, subject,institution,duration,totalMarks } = req.body;
        if(!title || !subject || !duration){
            return res.status(400).json({  success: false, message: "these are required"});
        }

        if(req.user?.role !== "teacher"){
            return res.status(403).json({ success: false,message: "Access denied. Teachers only." });
        }

        const newTest = await TestSeries.create({
            title,
            subject,
            duration,
            totalMarks,
            institution,
            createdBy: req.user._id,
        })
        res.status(201).json({ success: true, test: newTest });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server issue" });
    }
}

export const addQuestion = async(req: RequestWithUser,res:Response )=>{
    try {
        const { testId } = req.params;
        const { questions } = req.body;

        if(!questions){ 
            return res.status(400).json({success: false,message: "this must required"});
        }

        const test = await TestSeries.findById(testId);
        if(!test){
            return res.status(404).json({ message: "Test not found" });
        }

        if(req.user?.role !== "teacher"){
            return res.status(403).json({ success: false,message: "Access denied. Teachers only." });
        }

        test.questions.push(...questions);
        await test.save();

        res.status(200).json({ success: true, message: "Questions added", test });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server issue"})
    }
}

export const publishTest = async(req: RequestWithUser,res: Response)=>{
    try {
        const { testId } = req.params;
        const test = await TestSeries.findById(testId);
        if(!test){
            return res.status(404).json({ message: "Test not found" });
        }

        if(req.user?.role !== "teacher"){
            return res.status(403).json({ success: false,message: "Access denied. Teachers only." });
        }

        test.isPublished = true;
        await test.save();

        res.status(200).json({ success: true, message: "Test published successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server issue"})
    }
}

export const getTeachersTest = async(req: RequestWithUser,res: Response)=>{
    try {
        const tests = await TestSeries.find({ createdBy: req.user?._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, tests });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server issue" });
    }
}

export const deletedTest = async(req:RequestWithUser, res: Response)=>{
    try {
        const { testId } = req.params;
        const test = await TestSeries.findById(testId);
        if(!test){
            return res.status(404).json({ message: "Test not found" });
        }

        if(req.user?.role !== "teacher"){
            return res.status(403).json({ success: false,message: "Access denied. Teachers only." });
        }

        await test.deleteOne();
        res.status(200).json({ success: true, message: "Test deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Interal Server issue" });
    }
}