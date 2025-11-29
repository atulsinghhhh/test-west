import { StandaloneStudent } from "../models/standaloneStudent.model.js";
import { Attempt } from "../models/attempt.model.js";
import { Paper } from "../models/paper.model.js";
import { Question } from "../models/question.model.js";
import { genAI } from "../lib/ai.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import type { RequestWithUser } from "./user.controller.js";

export const standaloneSignup = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const existingUser = await StandaloneStudent.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        const student = await StandaloneStudent.create({
            name,
            email,
            password
        });

        const token = jwt.sign({ id: student._id, email: student.email, role: "standalone" }, process.env.JWT_SECRET!, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({ success: true, message: "Account created successfully", user: { ...student.toObject(), role: "standalone" } });

    } catch (error) {
        console.error("Standalone signup error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const standaloneLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const student = await StandaloneStudent.findOne({ email });
        if (!student) {
            return res.status(404).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: student._id, email: student.email, role: "standalone" }, process.env.JWT_SECRET!, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({ success: true, message: "Login successful", user: { ...student.toObject(), role: "standalone" } });

    } catch (error) {
        console.error("Standalone login error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getDashboardAnalysis = async (req: RequestWithUser, res: Response) => {
    try {
        const studentId = req.user?._id;
        if (!studentId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const student = await StandaloneStudent.findById(studentId);
        if (!student) return res.status(404).json({ success: false, message: "Student not found" });

        // Fetch all attempts
        const attempts = await Attempt.find({ studentId }).populate("subjectId", "subjectName");

        // Calculate basic stats
        const totalAttempts = attempts.length;
        const totalQuestions = attempts.reduce((sum, a) => sum + (a.totalMarks || 0), 0); // Approx
        const correctAnswers = attempts.reduce((sum, a) => sum + (a.obtainedMarks || 0), 0);
        const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        const avgScore = totalAttempts > 0 ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts) : 0;
        const highestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.percentage)) : 0;
        const lowestScore = attempts.length > 0 ? Math.min(...attempts.map(a => a.percentage)) : 0;
        
        // Subject-wise performance
        const subjectMap = new Map();
        attempts.forEach(a => {
            // @ts-ignore
            const subName = a.subjectId?.subjectName || "Unknown";
            if (!subjectMap.has(subName)) {
                subjectMap.set(subName, { total: 0, correct: 0, count: 0 });
            }
            const data = subjectMap.get(subName);
            data.total += (a.totalMarks || 0);
            data.correct += (a.obtainedMarks || 0);
            data.count += 1;
        });

        let subjectWisePerformance = "";
        subjectMap.forEach((data, subject) => {
            const acc = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
            subjectWisePerformance += `- Subject: ${subject}\n  Total Attempted: ${data.total}\n  Correct: ${data.correct}\n  Accuracy: ${acc}%\n`;
        });

        // Recent attempts
        const recentAttempts = attempts.slice(-5).map(a => ({
            score: a.percentage,
            // @ts-ignore
            subject: a.subjectId?.subjectName || "Unknown",
            timeTaken: "N/A" // We don't track time yet
        }));

        const prompt = `
Analyze the performance of a standalone student based on the following data. 
This student is not part of any school or teacher batch. They practice independently.

Student Details:
- Name: ${student.name}
- Total Attempts: ${totalAttempts}
- Overall Accuracy: ${accuracy}%
- Average Score: ${avgScore}%
- Highest Score: ${highestScore}%
- Lowest Score: ${lowestScore}%

Subject-wise Performance:
${subjectWisePerformance}

Recent Attempts:
${JSON.stringify(recentAttempts)}

Your task:
Provide a clear, simple, and motivational performance summary for this standalone student.
Explain their performance like a personal coach.

Return the final response STRICTLY in JSON format:
{
  "motivation": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "trend": "string",
  "subjectInsights": [{ "subject": "string", "insight": "string" }],
  "mistakePatterns": ["string"],
  "suggestedFocusAreas": ["string"],
  "weeklyPlan": ["string"],
  "positiveNote": "string"
}
`;

        const result = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{ parts: [{ text: prompt }] }]
        });

        let text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        text = text.replace(/```json|```/g, "").trim();
        const analysis = JSON.parse(text);

        return res.status(200).json({ success: true, analysis });

    } catch (error) {
        console.error("Error generating dashboard analysis:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getAllPapers = async (req: RequestWithUser, res: Response) => {
    try {
        // Fetch ALL published papers regardless of school/grade
        const papers = await Paper.find({ publishStatus: true }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, papers });
    } catch (error) {
        console.error("Error fetching all papers:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getAllQuizzes = async (req: RequestWithUser, res: Response) => {
    try {
        // Fetch ALL published question batches
        // We group by batchId similar to student controller
        const batches = await Question.aggregate([
            { $match: { isPublish: true, batchId: { $exists: true, $ne: null } } },
            { $group: { 
                _id: "$batchId", 
                subjectId: { $first: "$subjectId" },
                count: { $sum: 1 },
                createdAt: { $first: "$createdAt" }
            }},
            { $sort: { createdAt: -1 } },
            { $lookup: {
                from: "subjects",
                localField: "subjectId",
                foreignField: "_id",
                as: "subject"
            }},
            { $unwind: "$subject" },
            { $project: {
                _id: "$_id",
                batchId: "$_id",
                subjectName: "$subject.subjectName",
                totalQuestions: "$count",
                createdAt: 1
            }}
        ]);

        return res.status(200).json({ success: true, batches });
    } catch (error) {
        console.error("Error fetching all quizzes:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getQuestionsForBatchStandalone = async (req: RequestWithUser, res: Response) => {
    try {
        const { batchId } = req.params;
        const studentId = req.user?._id;

        if (!studentId) return res.status(401).json({ success: false, message: "Unauthorized" });

        // Check if already attempted
        const existingAttempt = await Attempt.findOne({ studentId, batchId });
        if (existingAttempt) {
            return res.status(403).json({ success: false, message: "You have already attempted this practice set." });
        }

        const questions = await Question.find({ batchId, isPublish: true }).select("-correctAnswer");
        
        if (!questions || questions.length === 0) {
            return res.status(404).json({ success: false, message: "Questions not found" });
        }

        return res.status(200).json({ success: true, questions });
    } catch (error) {
        console.error("Error fetching batch questions:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getPaperContentStandalone = async (req: RequestWithUser, res: Response) => {
    try {
        const { paperId } = req.params;
        const studentId = req.user?._id;

        if (!studentId) return res.status(401).json({ success: false, message: "Unauthorized" });

        // Check if already attempted
        const existingAttempt = await Attempt.findOne({ studentId, paperId });
        if (existingAttempt) {
            return res.status(403).json({ success: false, message: "You have already attempted this paper." });
        }

        const paper = await Paper.findOne({ _id: paperId, publishStatus: true });
        
        if (!paper) {
            return res.status(404).json({ success: false, message: "Paper not found" });
        }

        return res.status(200).json({ success: true, paper });
    } catch (error) {
        console.error("Error fetching paper content:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const attemptPaperStandalone = async (req: RequestWithUser, res: Response) => {
    try {
        const studentId = req.user?._id;
        const { paperId } = req.params;
        const { answers } = req.body;

        if (!studentId) return res.status(401).json({ success: false, message: "Unauthorized" });

        if (!paperId || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ success: false, message: "Invalid request data" });
        }

        // Check if already attempted
        const existingAttempt = await Attempt.findOne({ studentId, paperId });
        if (existingAttempt) {
            return res.status(403).json({ success: false, message: "Paper already attempted" });
        }

        const paper = await Paper.findById(paperId);
        if (!paper) return res.status(404).json({ success: false, message: "Paper not found" });

        const questions = paper.questions;
        if (!questions || questions.length === 0) {
            return res.status(404).json({ success: false, message: "Questions not found for this paper" });
        }

        let totalMarks = 0;
        let obtainedMarks = 0;
        const evaluatedAnswers = [];
        // @ts-ignore
        const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

        for (const ans of answers) {
            const question = questionMap.get(ans.questionId);
            if (!question) continue;

            const normalize = (val: any) => Array.isArray(val) ? val.map(v => v.toString().trim().toLowerCase()).sort().join(',') : val.toString().trim().toLowerCase();
            // @ts-ignore
            const isCorrect = normalize(question.correctAnswer) === normalize(ans.userAnswer);
            // @ts-ignore
            const marks = isCorrect ? (question.marks || 1) : 0;

            // @ts-ignore
            totalMarks += (question.marks || 1);
            obtainedMarks += marks;

            evaluatedAnswers.push({
                // @ts-ignore
                questionId: question._id,
                // @ts-ignore
                questionText: question.questionText,
                userAnswer: ans.userAnswer,
                // @ts-ignore
                correctAnswer: question.correctAnswer,
                isCorrect,
                marks
            });
        }
        
        // Recalculate total marks based on all questions
        // @ts-ignore
        totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);

        const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

        const newAttempt = await Attempt.create({
            studentId,
            paperId,
            subjectId: paper.subjectId,
            answers: evaluatedAnswers,
            totalMarks,
            obtainedMarks,
            percentage,
            status: "completed"
        });

        return res.status(200).json({ success: true, message: "Paper submitted successfully", result: newAttempt });

    } catch (error) {
        console.error("Error submitting paper:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const attemptQuestionBatchStandalone = async (req: RequestWithUser, res: Response) => {
    try {
        const studentId = req.user?._id;
        const { batchId } = req.params;
        const { answers } = req.body;

        if (!studentId) return res.status(401).json({ success: false, message: "Unauthorized" });

        // Check for existing attempt
        const existingAttempt = await Attempt.findOne({ studentId, batchId });
        if (existingAttempt) {
            return res.status(403).json({ success: false, message: "Batch already attempted" });
        }

        const questions = await Question.find({ batchId, isPublish: true });
        if (!questions.length) {
            return res.status(404).json({ success: false, message: "Questions not found" });
        }

        let totalMarks = 0;
        let obtainedMarks = 0;
        const evaluatedAnswers = [];
        const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

        for (const ans of answers) {
            const question = questionMap.get(ans.questionId);
            if (!question) continue;

            const normalize = (val: any) => Array.isArray(val) ? val.map(v => v.toString().trim().toLowerCase()).sort().join(',') : val.toString().trim().toLowerCase();
            const isCorrect = normalize(question.correctAnswer) === normalize(ans.userAnswer);
            const marks = isCorrect ? 1 : 0;

            totalMarks += 1;
            obtainedMarks += marks;

            evaluatedAnswers.push({
                questionId: question._id,
                questionText: question.questiontext,
                userAnswer: ans.userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect,
                marks
            });
        }
        
        totalMarks = questions.length;
        const percentage = (obtainedMarks / totalMarks) * 100;

        const newAttempt = await Attempt.create({
            studentId,
            batchId,
            // No gradeId for standalone
            subjectId: questions[0].subjectId,
            answers: evaluatedAnswers,
            totalMarks,
            obtainedMarks,
            percentage,
            status: "completed"
        });

        return res.status(200).json({ success: true, message: "Submitted successfully", result: newAttempt });

    } catch (error) {
        console.error("Error submitting standalone batch:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
