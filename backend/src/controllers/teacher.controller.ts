import { Question } from "../models/question.model.js";
import type { Response } from "express";
import type { RequestWithUser } from "./user.controller.js"
import { Teacher } from "../models/teacher.model.js";
import { School } from "../models/School.model.js";
import { Grade } from "../models/grade.model.js";
import { Subject } from "../models/subject.model.js";
import { Chapter } from "../models/chapter.model.js";
import { Topic } from "../models/topic.model.js";
import { subTopic } from "../models/subtopic.model.js";
import { genAI } from "../lib/ai.js";

export const addStudents = async (req: RequestWithUser, res: Response) => {
    try {

    } catch (error) {

    }
}


export const generateQuestionAI = async (req: RequestWithUser, res: Response) => {
    try {
        const { gradeId, subjectId, chapterId, topicId, subtopicId, questionType, difficulty, noofQuestions } = req.body;
        const teacherId = req.user?._id;

        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        const school = await School.findById(teacher.school);
        if (!school) {
            return res.status(404).json({ success: false, message: "School not found" });
        }

        const grade = await Grade.findById(gradeId);
        if (teacher.grade !== await grade.gradeName) {
            return res.status(403).json({ success: false, message: "You are not authorized for this grade" });
        }

        if (teacher.questionSchoolLimit < noofQuestions) {
            return res.status(400).json({ success: false, message: "Teacher question limit exceeded" });
        }

        if (school.questionAdminLimit < noofQuestions) {
            return res.status(400).json({ success: false, message: "School question limit exceeded" });
        }

        const subject = await Subject.findOne({ _id: subjectId, gradeId });
        const chapter = await Chapter.findOne({ _id: chapterId, subjectId });
        const topic = await Topic.findOne({ _id: topicId, chapterId });
        const subtopic = await subTopic.findOne({ _id: subtopicId, topicId });

        if (!grade || !subject || !chapter || !topic || !subtopic) {
            return res.status(400).json({ success: false, message: "Invalid syllabus structure" });
        }

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

        const result = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{ parts: [{ text: prompt }] }],
        })

        let text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        text = text.replace(/```json|```/g, "").trim();

        let generatedQuestions;
        try {
            generatedQuestions = JSON.parse(text);
        } catch (e) {
            return res.status(500).json({ success: false, message: "Failed to parse AI response", raw: text });
        }

        const savedQuestions = [];

        for (let q of generatedQuestions) {
            const newQ = await Question.create({
                schoolId: school._id,
                teacherId: teacher._id,
                gradeId,
                subjectId,
                chapterId,
                topicId,
                subtopicId,
                questiontext: q.questiontext,
                questionType: q.questionType,
                difficulty: q.difficulty,
                options: q.options || [],
                aiUsed: true
            });

            savedQuestions.push(newQ);
        }

        teacher.questionSchoolLimit -= noofQuestions;
        school.questionAdminLimit -= noofQuestions;
        await teacher.save();
        await school.save();

        return res.status(200).json({
            success: true,
            message: "AI Questions generated successfully",
            questions: savedQuestions,
            teacherRemainingLimit: teacher.questionSchoolLimit,
            schoolRemainingLimit: school.questionAdminLimit
        });
    } catch (error) {
        console.error("AI Question Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}