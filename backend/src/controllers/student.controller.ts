import { Grade } from "../models/grade.model.js";
import { School } from "../models/School.model.js";
import { Student } from "../models/student.model.js";
import { Teacher } from "../models/teacher.model.js";
import type { Response } from "express";
import type { RequestWithUser } from "./user.controller.js";
import { Paper } from "../models/paper.model.js";
import { Attempt } from "../models/attempt.model.js";
import { Question } from "../models/question.model.js";
import { Subject } from "../models/subject.model.js";

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
            section,
            schoolId
        });
        if(!newStudent){
            return res.status(400).json({ success: false, message: "failed to created the new Student" });
        }

        await School.findByIdAndUpdate(schoolId, {
            $push: { students: newStudent._id }
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

        // Get teacher's school first
        const teacher = await Teacher.findById(teacherId);
        if(!teacher){
            return res.status(404).json({ success: false, message: "teacher not found" });
        }

        // Find grade by gradeId and teacher's school
        const grade = await Grade.findOne({_id: gradeId, schoolId: teacher.school});
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
            teacherId,
            schoolId: teacher.school
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

export const fetchStudentsForSchool = async (req: RequestWithUser, res: Response) => {
    try {
        const schoolId = req.user?._id;
        if (!schoolId) return res.status(401).json({ success: false, message: "Unauthorized" });
        console.log("SchoolId: ",schoolId);

        const students = await Student.find({ schoolId }).populate("gradeId", "gradeName");
        console.log("students: ",students);
        return res.status(200).json({ success: true, students });
    } catch (error) {
        console.log("Error fetching school students:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const fetchStudentsForTeacher = async (req: RequestWithUser, res: Response) => {
    try {
        const teacherId = req.user?._id;
        if (!teacherId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const students = await Student.find({ teacherId }).populate("gradeId", "gradeName");
        return res.status(200).json({ success: true, students });
    } catch (error) {
        console.log("Error fetching teacher students:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const fetchPublishedPapers = async (req: RequestWithUser, res: Response) => {
    try {
        const studentId = req.user?._id;
        if (!studentId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ success: false, message: "Student not found" });
        
        const grade = await Grade.findById(student.gradeId);

        const papers = await Paper.find({
            gradeId: grade._id,
            publishStatus: true
        }).sort({ createdAt: -1 });

        return res.status(200).json({ success: true, papers });

    } catch (error) {
        console.log("Error fetching published papers:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const attemptQuestionBatch = async (req: RequestWithUser, res: Response) => {
    try {
        const studentId = req.user?._id;
        const { batchId } = req.params; // Get batchId from params as per route
        const { answers } = req.body;

        if (!studentId) return res.status(401).json({ success: false, message: "Unauthorized" });

        if (!batchId || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ success: false, message: "Invalid request data" });
        }

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ success: false, message: "Student not found" });

        // Check if already attempted
        const existingAttempt = await Attempt.findOne({ studentId, batchId });
        if (existingAttempt) {
            return res.status(403).json({ success: false, message: "Batch already attempted" });
        }

        const questions = await Question.find({ batchId, isPublish: true });
        if (!questions || questions.length === 0) {
            return res.status(404).json({ success: false, message: "Questions not found" });
        }

        let totalMarks = 0;
        let obtainedMarks = 0;
        const evaluatedAnswers = [];

        // Create a map for quick question lookup
        const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

        for (const ans of answers) {
            const question = questionMap.get(ans.questionId);
            if (!question) continue;

            const isCorrect = compareAnswers(question.correctAnswer, ans.userAnswer, question.questionType);
            const marks = isCorrect ? 1 : 0; // Assuming 1 mark per question for now

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
            gradeId: student.gradeId,
            subjectId: questions[0].subjectId, // Assuming all questions in batch have same subject
            answers: evaluatedAnswers,
            totalMarks,
            obtainedMarks,
            percentage,
            status: "completed"
        });

        return res.status(200).json({ success: true, message: "Submitted successfully", result: newAttempt });

    } catch (error) {
        console.log("Error submitting question batch:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const compareAnswers = (correct: any, user: any, type: string): boolean => {
    if (!correct || !user) return false;
    
    // Normalize
    const normalize = (val: any) => Array.isArray(val) ? val.map(v => v.toString().trim().toLowerCase()).sort().join(',') : val.toString().trim().toLowerCase();

    return normalize(correct) === normalize(user);
};

export const fetchQuestionSubmissions = async (req: RequestWithUser, res: Response) => {
    try {
        const studentId = req.user?._id;
        
        const attempts = await Attempt.find({ studentId, batchId: { $exists: true } })
            .sort({ createdAt: -1 })
            .populate("subjectId", "subjectName");

        return res.status(200).json({ success: true, attempts });
    } catch (error) {
        console.log("Error fetching submissions:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


export const viewBatchResult = async (req: RequestWithUser, res: Response) => {
    try {
        const { batchId } = req.params;
        const studentId = req.user?._id;

        const attempt = await Attempt.findOne({ studentId, batchId });
        if (!attempt) {
            return res.status(404).json({ success: false, message: "Result not found" });
        }

        return res.status(200).json({ success: true, attempt });
    } catch (error) {
        console.log("Error viewing batch result:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const submitPracticeQuiz = async (req: RequestWithUser, res: Response) => {
    try {
        const studentId = req.user?._id;
        const { answers } = req.body;

        if (!studentId) return res.status(401).json({ success: false, message: "Unauthorized" });
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ success: false, message: "Invalid answers format" });
        }

        const student = await Student.findById(studentId);
        
        let totalMarks = 0;
        let obtainedMarks = 0;
        const evaluatedAnswers = [];

        for (const ans of answers) {
            const question = await Question.findById(ans.questionId);
            if (!question) continue;

            const isCorrect = compareAnswers(question.correctAnswer, ans.userAnswer, question.questionType);
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

        const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

        // Generate a unique batch ID for this practice session
        const practiceBatchId = `practice_${Date.now()}`;

        const newAttempt = await Attempt.create({
            studentId,
            batchId: practiceBatchId, // Use a special ID for practice quizzes
            gradeId: student?.gradeId,
            answers: evaluatedAnswers,
            totalMarks,
            obtainedMarks,
            percentage,
            status: "completed",
            feedback: "Practice Quiz"
        });

        return res.status(200).json({ success: true, message: "Practice submitted", result: newAttempt });

    } catch (error) {
        console.log("Error submitting practice quiz:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const createPracticeQuiz = async (req: RequestWithUser, res: Response) => {
    try {
        const studentId = req.user?._id;
        const { subjectId, count = 10 } = req.body;

        if (!studentId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ success: false, message: "Student not found" });

        // 1. Get all questions attempted by this student
        const attempts = await Attempt.find({ studentId });
        const attemptedQuestionIds = new Set<string>();
        
        attempts.forEach(attempt => {
            if (attempt.answers && Array.isArray(attempt.answers)) {
                attempt.answers.forEach((ans: any) => {
                    if (ans.questionId) {
                        attemptedQuestionIds.add(ans.questionId.toString());
                    }
                });
            }
        });

        const query: any = { 
            gradeId: student.gradeId,
            isPublish: true,
            _id: { $nin: Array.from(attemptedQuestionIds) } // Exclude attempted questions
        };

        if (subjectId) {
            query.subjectId = subjectId;
        }

        const questions = await Question.aggregate([
            { $match: query },
            { $sample: { size: parseInt(count as string) } }
        ]);

        if (!questions || questions.length === 0) {
            return res.status(404).json({ success: false, message: "No new questions available for practice." });
        }

        return res.status(200).json({ success: true, questions });

    } catch (error) {
        console.log("Error creating practice quiz:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const fetchStudentDashboardStats = async (req: RequestWithUser, res: Response) => {
    try {
        const studentId = req.user?._id;
        if (!studentId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const attempts = await Attempt.find({ studentId });

        // Helper to calculate stats
        const calculateStats = (items: any[]) => {
            const count = items.length;
            const avg = count > 0 ? items.reduce((sum, item) => sum + item.percentage, 0) / count : 0;
            return { count, avg };
        };

        // 1. Papers
        const paperAttempts = attempts.filter(a => a.paperId);
        const paperStats = calculateStats(paperAttempts);

        // 2. Question Batches (excluding practice)
        const batchAttempts = attempts.filter(a => a.batchId && (!a.batchId.toString().startsWith("practice_")));
        const batchStats = calculateStats(batchAttempts);

        // 3. Practice Quizzes
        const practiceAttempts = attempts.filter(a => a.batchId && a.batchId.toString().startsWith("practice_"));
        const practiceStats = calculateStats(practiceAttempts);

        // Recent Activity
        const recentActivity = await Attempt.find({ studentId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("paperId", "paperId")
            .populate("subjectId", "subjectName"); // Assuming subjectId is populated

        // Subject-wise Stats
        const subjectStatsMap = new Map();
        attempts.forEach(attempt => {
             if (attempt.subjectId) {
                 // @ts-ignore
                 const subName = attempt.subjectId.subjectName || "Unknown";
                 if (!subjectStatsMap.has(subName)) {
                     subjectStatsMap.set(subName, { total: 0, count: 0 });
                 }
                 const stat = subjectStatsMap.get(subName);
                 stat.total += attempt.percentage;
                 stat.count += 1;
             }
        });

        const subjectStats = Array.from(subjectStatsMap.entries()).map(([name, data]) => ({
            subjectName: name,
            avgScore: data.total / data.count,
            totalAttempts: data.count
        }));


        return res.status(200).json({
            success: true,
            stats: {
                papers: paperStats,
                batches: batchStats,
                practice: practiceStats,
                recentActivity,
                subjectStats
            }
        });

    } catch (error) {
        console.log("Error fetching dashboard stats:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const fetchPaperContent = async (req: RequestWithUser, res: Response) => {
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
        console.log("Error fetching paper content:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const fetchQuestionsForBatch = async (req: RequestWithUser, res: Response) => {
    try {
        const { batchId } = req.params;
        const studentId = req.user?._id;

        if (!studentId) return res.status(401).json({ success: false, message: "Unauthorized" });

        // Check if already attempted
        const existingAttempt = await Attempt.findOne({ studentId, batchId });
        if (existingAttempt) {
            return res.status(403).json({ success: false, message: "You have already attempted this practice set." });
        }

        const questions = await Question.find({ batchId, isPublish: true }).select("-correctAnswer"); // Hide correct answer
        
        if (!questions || questions.length === 0) {
            return res.status(404).json({ success: false, message: "Questions not found" });
        }

        return res.status(200).json({ success: true, questions });
    } catch (error) {
        console.log("Error fetching questions for batch:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const attemptPaper = async (req: RequestWithUser, res: Response) => {
    try {
        const studentId = req.user?._id;
        const { paperId } = req.params;
        const { answers } = req.body;

        if (!studentId) return res.status(401).json({ success: false, message: "Unauthorized" });

        if (!paperId || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ success: false, message: "Invalid request data" });
        }

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ success: false, message: "Student not found" });

        // Check if already attempted
        const existingAttempt = await Attempt.findOne({ studentId, paperId });
        if (existingAttempt) {
            return res.status(403).json({ success: false, message: "Paper already attempted" });
        }

        const paper = await Paper.findById(paperId);
        if (!paper) return res.status(404).json({ success: false, message: "Paper not found" });

        // Use embedded questions from the paper
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

            // @ts-ignore
            const isCorrect = compareAnswers(question.correctAnswer, ans.userAnswer, question.type);
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
        
        // Recalculate total marks based on all questions in the paper, not just answered ones
        // @ts-ignore
        totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);

        const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

        const newAttempt = await Attempt.create({
            studentId,
            paperId,
            gradeId: student.gradeId,
            subjectId: paper.subjectId,
            answers: evaluatedAnswers,
            totalMarks,
            obtainedMarks,
            percentage,
            status: "completed"
        });

        return res.status(200).json({ success: true, message: "Paper submitted successfully", result: newAttempt });

    } catch (error) {
        console.log("Error submitting paper:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const fetchPublishedQuestions = async (req: RequestWithUser, res: Response) => {
    try {
        const studentId = req.user?._id;
        if (!studentId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ success: false, message: "Student not found" });

        // Fetch distinct batches for the student's grade
        // We want to list "Question Batches" available for practice
        // Assuming questions with `batchId` and `isPublish: true` are what we want.
        // We need to group by `batchId`.
        
        const batches = await Question.aggregate([
            { $match: { gradeId: student.gradeId, isPublish: true, batchId: { $exists: true, $ne: null } } },
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

        // Return as `batches` to match frontend expectation
        return res.status(200).json({ success: true, batches });

    } catch (error) {
        console.log("Error fetching published questions:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const viewPaperResult = async (req: RequestWithUser, res: Response) => {
    try {
        const { paperId } = req.params;
        const studentId = req.user?._id;

        const attempt = await Attempt.findOne({ studentId, paperId }).populate("paperId");
        if (!attempt) {
            return res.status(404).json({ success: false, message: "Result not found" });
        }

        return res.status(200).json({ success: true, attempt });
    } catch (error) {
        console.log("Error viewing paper result:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};