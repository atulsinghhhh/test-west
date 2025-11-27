import { Grade } from "../models/grade.model.js";
import { School } from "../models/School.model.js";
import { Student } from "../models/student.model.js";
import { Teacher } from "../models/teacher.model.js";
import type { Response } from "express";
import type { RequestWithUser } from "./user.controller.js";
import { Paper } from "../models/paper.model.js";
import { Attempt } from "../models/attempt.model.js";
import { Question } from "../models/question.model.js";

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

export const fetchStudentsForSchool = async (req: RequestWithUser, res: Response) => {
    try {
        const schoolId = req.user?._id;
        if (!schoolId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const students = await Student.find({ schoolId }).populate("gradeId", "gradeName");
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

        const papers = await Paper.find({
            gradeId: student.gradeId,
            publishStatus: true
        }).sort({ createdAt: -1 });

        return res.status(200).json({ success: true, papers });
    } catch (error) {
        console.log("Error fetching published papers:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
export const fetchPaperContent = async (req: RequestWithUser, res: Response) => {
    try {
        const { paperId } = req.params;
        const studentId = req.user?._id;

        if (!studentId) return res.status(401).json({ success: false, message: "Unauthorized" });

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

export const attemptPaper = async (req: RequestWithUser, res: Response) => {
    try {
        const { paperId } = req.params;
        const studentId = req.user?._id;
        const { answers } = req.body; 

        if (!paperId) {
            return res.status(400).json({ success: false, message: "paperId is required" });
        }

        const paper = await Paper.findOne({ _id: paperId, publishStatus: true });
        if (!paper) {
            return res.status(404).json({ success: false, message: "Paper not found or not published" });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        const existingAttempt = await Attempt.findOne({ studentId, paperId });
        if (existingAttempt) {
            return res.status(400).json({ success: false, message: "Paper already attempted" });
        }

        let totalMarks = 0;
        let obtainedMarks = 0;
        const evaluatedAnswers = [];

        const questionMap = new Map(paper.questions.map((q: any) => [q._id.toString(), q]));

        if (answers && Array.isArray(answers)) {
            for (const ans of answers) {
                const question = questionMap.get(ans.questionId);
                if (!question) continue;

                const isCorrect = compareAnswers(question.correctAnswer, ans.userAnswer, question.type);
                const marks = isCorrect ? (question.marks || 1) : 0;

                obtainedMarks += marks;
                
                evaluatedAnswers.push({
                    questionId: question._id,
                    questionText: question.questionText,
                    userAnswer: ans.userAnswer,
                    correctAnswer: question.correctAnswer,
                    isCorrect,
                    marks
                });
            }
        }
        
        totalMarks = paper.questions.reduce((sum: number, q: any) => sum + (q.marks || 1), 0);
        
        if (totalMarks === 0) totalMarks = paper.totalMarks; 

        const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

        const newAttempt = await Attempt.create({
            studentId,
            paperId,
            subjectId: paper.subjectId,
            gradeId: paper.gradeId,
            answers: evaluatedAnswers,
            totalMarks,
            obtainedMarks,
            percentage,
            status: "completed",
            timeTaken: 0 
        });

        return res.status(200).json({ success: true, message: "Paper submitted successfully", result: newAttempt });

    } catch (error) {
        console.log("Error submitting paper:", error);
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

export const fetchPublishedQuestions = async (req: RequestWithUser, res: Response) => {
    try {
        const studentId = req.user?._id;
        if (!studentId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ success: false, message: "Student not found" });

        const batches = await Question.aggregate([
            {
                $match: {
                    gradeId: student.gradeId,
                    isPublish: true
                }
            },
            {
                $group: {
                    _id: "$batchId",
                    batchId: { $first: "$batchId" },
                    subjectId: { $first: "$subjectId" },
                    chapterId: { $first: "$chapterId" }, 
                    topicId: { $first: "$topicId" },
                    totalQuestions: { $sum: 1 },
                    createdAt: { $first: "$createdAt" }
                }
            },
            {
                $lookup: {
                    from: "subjects",
                    localField: "subjectId",
                    foreignField: "_id",
                    as: "subject"
                }
            },
            {
                $unwind: "$subject"
            },
            {
                $project: {
                    batchId: 1,
                    totalQuestions: 1,
                    createdAt: 1,
                    subjectName: "$subject.subjectName"
                }
            },
             { $sort: { createdAt: -1 } }
        ]);

        return res.status(200).json({ success: true, batches });

    } catch (error) {
        console.log("Error fetching published questions:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
export const fetchQuestionsForBatch = async (req: RequestWithUser, res: Response) => {
    try {
        const { batchId } = req.params;
        const studentId = req.user?._id;

        if (!studentId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const questions = await Question.find({ batchId, isPublish: true }).select("-correctAnswer"); // Hide correct answer
        
        if (!questions || questions.length === 0) {
            return res.status(404).json({ success: false, message: "Questions not found" });
        }

        return res.status(200).json({ success: true, questions });
    } catch (error) {
        console.log("Error fetching batch questions:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const attemptQuestionBatch = async (req: RequestWithUser, res: Response) => {
    try {
        const { batchId } = req.params;
        const studentId = req.user?._id;
        const { answers } = req.body; // Array of { questionId, userAnswer }

        if (!batchId || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ success: false, message: "Invalid request data" });
        }

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ success: false, message: "Student not found" });

        // Check if already attempted
        const existingAttempt = await Attempt.findOne({ studentId, batchId });
        if (existingAttempt) {
            return res.status(400).json({ success: false, message: "Batch already attempted" });
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