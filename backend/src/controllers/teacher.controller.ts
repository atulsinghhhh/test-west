import { model } from "../lib/ai.js";
import { Question } from "../models/question.model.js";
import type { Response } from "express";
import type { RequestWithUser } from "./user.controller.js"

export const addStudents = async(req: RequestWithUser,res: Response)=>{
    try {
        
    } catch (error) {
        
    }
}

export const generateQuestionAI = async (req: RequestWithUser,res: Response)=>{
    try {
        const { gradeId,subjectId,chapterId,topicId,subtopicId,questionType,difficulty,noofQuestions } = req.body;

        const prompt = `Generate ${noofQuestions} ${difficulty} level ${questionType.toUpperCase()} questions.
            SYLLABUS CONTEXT: 
            Grade ID: ${gradeId}
            Subject ID: ${subjectId}
            Chapter ID: ${chapterId}
            Topic ID: ${topicId}
            Subtopic ID: ${subtopicId}

            RETURN FORMAT (VERY IMPORTANT):
            Return ONLY JSON, no explanation.
            [
                {
                    "questionText": "",
                    "options": ["A","B","C","D"],
                    "correctAnswer": "",
                    "difficulty": "${difficulty}",
                    "type": "${questionType}"
                }
            ]
            `;

        // await model(prompt)
    } catch (error) {
        
    }
}