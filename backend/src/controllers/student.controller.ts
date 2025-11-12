import { TestSeries } from "../models/test.model.js";
import { Submission } from "../models/submission.model.js";
import type { Request, Response } from "express";
import type { RequestWithUser } from "./user.controller.js"
import { resourceLimits } from "worker_threads";

export const fetchTestSeries = async(req:RequestWithUser, res: Response)=>{
    try {
        const tests = await TestSeries.find({ isPublished: true}).sort({createdAt: -1});
        if(!tests){
            return res.status(400).json({success: false,message: "failed to fetch publish testseries"});
        }

        if(req.user?.role !== "student"){
            return res.status(403).json({ success: false,message: "Access denied." });
        }

        res.status(200).json({success: true, message: "successfully fetch"});
    } catch (error) {
        console.log("Error occuring: ",error);
        res.status(500).json({success: false,message: "Internal Server issue"});
    }
}

export const getTestById = async (req:RequestWithUser, res: Response) => {
    try {
        const test = await TestSeries.findById(req.params.testId);

        if (!test || !test.isPublished)
        return res.status(404).json({ success: false,message: "Test not found" });

        if(req.user?.role !== "student"){
            return res.status(403).json({ success: false,message: "Access denied." });
        }

        res.status(200).json({success: true,test});
    } catch (error) {
        res.status(500).json({ message: "Error fetching test", error });
    }
};


export const submitTest = async(req: RequestWithUser,res: Response)=>{
    try {
        const { testId } = req.params;
        const { answers } = req.body;

        const tests = await TestSeries.findById(testId);
        if(!tests){
            return res.status(404).json({ success: false,message: "Test not found" });
        }

        if(req.user?.role !== "student"){
            return res.status(403).json({ success: false,message: "Access denied." });
        }

        let score = 0;
        const evaluatedAnswers = tests.questions.map((q: any) => {
            const studentAns = answers.find(
                (a: any) => a.questionId === q._id.toString()
            );

            let isCorrect = false;
            let markObtained = 0;

            if (q.type === "mcq" && studentAns?.answer === q.correctAnswer) {
                isCorrect = true;
                markObtained = q.marks || 0; 
            }

            return {
                questionId: q._id,
                answer: studentAns ? studentAns.answer : "",
                isCorrect,
                markObtained,
            };
        });

        const submission = await Submission.create({
            testId: tests._id,
            studentId: req.user?._id,
            answers: evaluatedAnswers,
            score,
            submittedAt: new Date(),
        });

        res.status(201).json({
            message: "Test submitted successfully",
            totalScore: score,
            submissionId: submission._id,
        });

    } catch (error) {
        
    }
}

export const getTestResult = async(req: RequestWithUser,res: Response)=>{
    try {
        const { testId } = req.params;

        const result=await Submission.findOne({testId, studentId: req.user?._id}).populate("testId", "title totalMarks");
        if(!result){
            return res.status(404).json({success: false ,message: "Result not found" });
        }
        if(req.user?.role !== "student"){
            return res.status(403).json({ success: false,message: "Access denied." });
        }

        res.status(200).json({success: true,result});
    } catch (error) {
        res.status(500).json({ success: false,message: "Error fetching result"});
    }
}

export const getAllResults = async(req: RequestWithUser,res: Response)=>{
    try {
        const results = await Submission.find({ studentId: req.user?._id })
        .populate("testId", "title subject totalMarks")
        .sort({ submittedAt: -1 });

        if(!results){
            return res.status(404).json({success: false ,message: "Result not found" });
        }

        if(req.user?.role !== "student"){
            return res.status(403).json({ success: false,message: "Access denied." });
        }

        res.status(200).json({success: true,resourceLimits});

    } catch (error) {
        res.status(500).json({ success: false,message: "Error fetching result"});
    }
}
