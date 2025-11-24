import { Question } from "../models/question.model.js";
import type { Response } from "express";
import type { RequestWithUser } from "./user.controller.js"
import { Teacher } from "../models/teacher.model.js";
import { School } from "../models/School.model.js";
import { Subject } from "../models/subject.model.js";
import { Chapter } from "../models/chapter.model.js";
import { Topic } from "../models/topic.model.js";
import { subTopic } from "../models/subtopic.model.js";
import { genAI } from "../lib/ai.js";
import { ensureTeacherGradeFields } from "../lib/teacherGrade.js";
import { Paper } from "../models/paper.model.js";
import { PDFGenerate } from "../lib/pdfgenerate.js";

const getTeacherContext = async (req: RequestWithUser) => {
    const teacherId = req.user?._id;
    if (req.user?.role !== "teacher") {
        throw new Error("Unauthorized");
    }
    if (!teacherId) {
        throw new Error("Unauthorized");
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
        throw new Error("Teacher not found");
    }

    await ensureTeacherGradeFields(teacher);
    return teacher;
};

export const getTeacherGrade = async (req: RequestWithUser, res: Response) => {
    try {
        const teacher = await getTeacherContext(req);
        const remainingQuestions = Math.max(teacher.questionSchoolLimit - teacher.questionSchoolCount, 0);

        const gradeLabel = teacher.gradeName || (teacher as any).grade || "N/A";

        return res.status(200).json({
            success: true,
            grade: {
                gradeId: teacher.gradeId,
                gradeName: gradeLabel,
                remainingQuestions,
                questionLimit: teacher.questionSchoolLimit,
                questionUsed: teacher.questionSchoolCount,
                paperLimit: teacher.paperSchoolLimit,
                paperUsed: teacher.paperSchoolCount
            }
        });
    } catch (error) {
        console.error("Error fetching teacher grade:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getTeacherSubjects = async (req: RequestWithUser, res: Response) => {
    try {
        const teacher = await getTeacherContext(req);

        const subjects = await Subject.find({
            gradeId: teacher.gradeId,
            schoolId: teacher.school
        }).sort({ subjectName: 1 });

        return res.status(200).json({ success: true, subjects });
    } catch (error) {
        console.error("Error fetching teacher subjects:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getTeacherChapters = async (req: RequestWithUser, res: Response) => {
    try {
        const teacher = await getTeacherContext(req);
        const { subjectId } = req.params;

        const subject = await Subject.findOne({
            _id: subjectId,
            gradeId: teacher.gradeId,
            schoolId: teacher.school
        });

        if (!subject) {
            return res.status(404).json({ success: false, message: "Subject not found" });
        }

        const chapters = await Chapter.find({
            subjectId,
            schoolId: teacher.school
        }).sort({ chapterName: 1 });

        return res.status(200).json({ success: true, chapters });
    } catch (error) {
        console.error("Error fetching teacher chapters:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getTeacherTopics = async (req: RequestWithUser, res: Response) => {
    try {
        const teacher = await getTeacherContext(req);
        const { chapterId } = req.params;

        const chapter = await Chapter.findOne({
            _id: chapterId,
            schoolId: teacher.school
        });

        if (!chapter) {
            return res.status(404).json({ success: false, message: "Chapter not found" });
        }

        const subject = await Subject.findOne({
            _id: chapter.subjectId,
            gradeId: teacher.gradeId,
            schoolId: teacher.school
        });

        if (!subject) {
            return res.status(403).json({ success: false, message: "Chapter not part of assigned grade" });
        }

        const topics = await Topic.find({
            chapterId,
            schoolId: teacher.school
        }).sort({ topicName: 1 });

        return res.status(200).json({ success: true, topics });
    } catch (error) {
        console.error("Error fetching teacher topics:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getTeacherSubtopics = async (req: RequestWithUser, res: Response) => {
    try {
        const teacher = await getTeacherContext(req);
        const { topicId } = req.params;

        const topic = await Topic.findOne({
            _id: topicId,
            schoolId: teacher.school
        });

        if (!topic) {
            return res.status(404).json({ success: false, message: "Topic not found" });
        }

        const chapter = await Chapter.findOne({
            _id: topic.chapterId,
            schoolId: teacher.school
        });

        if (!chapter) {
            return res.status(403).json({ success: false, message: "Topic not part of assigned grade" });
        }

        const subject = await Subject.findOne({
            _id: chapter.subjectId,
            gradeId: teacher.gradeId,
            schoolId: teacher.school
        });

        if (!subject) {
            return res.status(403).json({ success: false, message: "Topic not part of assigned grade" });
        }

        const subtopics = await subTopic.find({
            topicId,
            schoolId: teacher.school
        }).sort({ subtopicName: 1 });

        return res.status(200).json({ success: true, subtopics });
    } catch (error) {
        console.error("Error fetching teacher subtopics:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


export const generateQuestionAI = async (req: RequestWithUser, res: Response) => {
    try {
        const { subjectId, chapterId, topicId, subtopicId, questionType, difficulty, noofQuestions } = req.body;
        const teacher = await getTeacherContext(req);

        const school = await School.findById(teacher.school);
        if (!school) {
            return res.status(404).json({ success: false, message: "School not found" });
        }

        const requestedQuestions = Number(noofQuestions);
        if (!requestedQuestions || requestedQuestions <= 0) {
            return res.status(400).json({ success: false, message: "Invalid question count" });
        }

        const subject = await Subject.findOne({
            _id: subjectId,
            gradeId: teacher.gradeId,
            schoolId: teacher.school
        });

        const chapter = await Chapter.findOne({
            _id: chapterId,
            subjectId,
            schoolId: teacher.school
        });

        const topic = await Topic.findOne({
            _id: topicId,
            chapterId,
            schoolId: teacher.school
        });

        const subtopic = await subTopic.findOne({
            _id: subtopicId,
            topicId,
            schoolId: teacher.school
        });

        if (!subject || !chapter || !topic || !subtopic) {
            return res.status(400).json({ success: false, message: "Invalid syllabus structure" });
        }

        const teacherRemaining = teacher.questionSchoolLimit - teacher.questionSchoolCount;
        if (teacherRemaining < requestedQuestions) {
            return res.status(400).json({ success: false, message: "Teacher question limit exceeded" });
        }

        const schoolRemaining = school.questionAdminLimit - school.questionAdminCount;
        if (schoolRemaining < requestedQuestions) {
            return res.status(400).json({ success: false, message: "School question limit exceeded" });
        }

        const prompt = `Generate ${requestedQuestions} ${difficulty} level ${questionType.toUpperCase()} questions.
            SYLLABUS CONTEXT: 
            Grade ID: ${teacher.gradeId}
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

        let result;
        try {
            result = await genAI.models.generateContent({
                model: "gemini-2.0-flash",
                contents: [{ parts: [{ text: prompt }] }],
            });
        } catch (apiError) {
            const statusCode = (apiError as any)?.status || (apiError as any)?.response?.status;
            const apiMessage =
                (apiError as any)?.error?.message ||
                (apiError as any)?.message ||
                "AI service error";

            if (statusCode === 429 || (apiError as any)?.error?.status === "RESOURCE_EXHAUSTED") {
                return res.status(429).json({
                    success: false,
                    message: apiMessage || "AI usage limit reached. Please try again later.",
                });
            }

            throw apiError;
        }

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
            const finalType = (questionType || "").toLowerCase();
            const isObjective = finalType === "mcq" || finalType === "msq";
            const normalizedDifficulty = (q.difficulty || difficulty || "").toLowerCase();

            const cleanedQuestion = q.questionText || q.questiontext;
            if (!cleanedQuestion) {
                continue;
            }

            const newQ = await Question.create({
                schoolId: school._id,
                teacherId: teacher._id,
                gradeId: teacher.gradeId,
                subjectId,
                chapterId,
                topicId,
                subtopicId,
                questiontext: cleanedQuestion,
                questionType: finalType,
                difficulty: normalizedDifficulty || "medium",
                noofQuestions: 1,
                options: isObjective ? q.options || [] : [],
                correctAnswer: isObjective ? q.correctAnswer : undefined,
                aiUsed: true
            });

            savedQuestions.push(newQ);
        }

        teacher.questionSchoolCount += requestedQuestions;
        school.questionAdminCount += requestedQuestions;
        await teacher.save();
        await school.save();

        const updatedTeacherRemaining = Math.max(teacher.questionSchoolLimit - teacher.questionSchoolCount, 0);
        const updatedSchoolRemaining = Math.max(school.questionAdminLimit - school.questionAdminCount, 0);

        return res.status(200).json({
            success: true,
            message: "AI Questions generated successfully",
            questions: savedQuestions,
            teacherRemainingLimit: updatedTeacherRemaining,
            teacherQuestionUsed: teacher.questionSchoolCount,
            schoolRemainingLimit: updatedSchoolRemaining,
            schoolQuestionUsed: school.questionAdminCount
        });
    } catch (error) {
        console.error("AI Question Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const generatepaperAI = async(req: RequestWithUser,res: Response)=>{
    try {
        const {duration, totalMarks,totalQuestion,Instructions,paperType,testType,subjectId,chapterId} = req.body;
        const teacher = await getTeacherContext(req);
    
        const school = await School.findById(teacher.school);
        if (!school) {
            return res.status(404).json({ success: false, message: "School not found" });
        }
    
    
        const requestedQuestions = Number(totalQuestion);
            if (!requestedQuestions || requestedQuestions <= 0) {
                return res.status(400).json({ success: false, message: "Invalid question count" });
            }
    
        const subject = await Subject.findOne({
            _id: subjectId,
            gradeId: teacher.gradeId,
            schoolId: teacher.school
        });
        const chapter =  await Chapter.findOne({
            _id: chapterId,
            subjectId,
            schoolId: teacher.school
        })
    
        if (!subject || !chapter) {
            return res.status(400).json({ success: false, message: "Invalid syllabus structure" });
        }
    
        const teacherRemaining = teacher.paperSchoolLimit - teacher.paperSchoolCount;
        if (teacherRemaining < requestedQuestions) {
            return res.status(400).json({ success: false, message: "Teacher question limit exceeded" });
        }
    
        const schoolRemaining = school.paperAdminLimit - school.paperAdminCount;
        if (schoolRemaining < requestedQuestions) {
            return res.status(400).json({ success: false, message: "School question limit exceeded" });
        }
    
        const prompt = `
            You are an expert question-paper generator for schools. 
            Generate a structured exam paper based on the following details:
    
            - Duration: {{duration}} minutes
            - Total Marks: {{totalMarks}}
            - Total Questions: {{totalQuestion}}
            - Instructions: {{instructions}}
            - Paper Type: {{paperType}} (e.g., Objective, Subjective, Mixed)
            - Test Type: {{testType}} (e.g., Unit Test, Mid Term, Half Yearly)
            - Subject ID: {{subjectId}}
            - Chapter ID: {{chapterId}}
    
            Rules:
            1. Create questions only from the given chapterId.
            2. Ensure the total number of questions matches {{totalQuestion}}.
            3. Ensure the total marks exactly sum to {{totalMarks}}.
            4. Add a proper heading:
            - School Name (Placeholder)
            - Exam Name (testType)
            - Subject Name (based on subjectId)
            - Paper Type
            - Duration & Total Marks
            5. Provide the question paper in a clean, structured format:
            - Section A: Easy
            - Section B: Medium
            - Section C: Hard
            (Automatically distribute marks based on difficulty)
            6. For MCQs: give 4 options.
            7. For subjective: give short & long answer questions depending on marks.
            8. DO NOT create answers unless asked. Only generate the question paper.
    
            Output Format:
            """
            [EXAM TITLE]
    
            Instructions:
            {{instructions}}
    
            Duration: {{duration}} minutes
            Total Marks: {{totalMarks}}
    
            SECTION A (Easy)
            Q1. ...
            Q2. ...
    
            SECTION B (Medium)
            Q...
    
            SECTION C (Hard)
            Q...
    
            """
    
            Now generate the complete question paper based on the given parameters.
        `
    
        let result;
        try {
            result = await genAI.models.generateContent({
                model: "gemini-2.0-flash",
                contents: [{ parts: [{ text: prompt }] }],
            });
        } catch (apiError) {
            const statusCode = (apiError as any)?.status || (apiError as any)?.response?.status;
            const apiMessage =
                (apiError as any)?.error?.message ||
                (apiError as any)?.message ||
                "AI service error";
    
            if (statusCode === 429 || (apiError as any)?.error?.status === "RESOURCE_EXHAUSTED") {
                return res.status(429).json({
                    success: false,
                    message: apiMessage || "AI usage limit reached. Please try again later.",
                });
            }
    
            throw apiError;
        }
    
        let text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        text = text.replace(/```json|```/g, "").trim();
    
        const paperText = text;

        const paper = await Paper.create({
            teacherId: teacher._id,
            schoolId: teacher.school,
            duration,
            totalMarks,
            totalQuestion,
            Instructions,
            paperType,
            testType,

            subjectId,
            chapterId,
            paperContent: paperText,
        });

        teacher.paperSchoolCount+=requestedQuestions;
        await teacher.save();

        school.paperAdminCount+=requestedQuestions;
        await school.save();

        const updatedTeacherRemaining = Math.max(teacher.paperSchoolLimit - teacher.paperSchoolCount, 0);
        const updatedSchoolRemaining = Math.max(school.paperAdminLimit - school.paperAdminCount, 0);

        return res.status(200).json({
            success: true,
            message: "AI Papers generated successfully",
            paper,
            teacherRemainingLimit: updatedTeacherRemaining,
            teacherPaperUsed: teacher.paperSchoolCount,
            schoolRemainingLimit: updatedSchoolRemaining,
            schoolpaperUsed: school.paperAdminCount
        });
    } catch (error) {
        console.error("AI Paper Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }

}

export const downloadPaperPDF = async (req, res) => {
    try {
        const { paperId } = req.params;

        const paper = await Paper.findById(paperId);
        if (!paper) {
            return res.status(404).json({ success: false, message: "Paper not found" });
        }

        const content = `
            Exam Type: ${paper.testType}
            Paper Type: ${paper.paperType}
            Duration: ${paper.duration} mins
            Total Marks: ${paper.totalMarks}
            Total Questions: ${paper.totalQuestion}

            Instructions:
            ${paper.Instructions}

            -----------------------

            ${paper.paperContent}
            `;

        const { filePath, fileName } = await PDFGenerate(content, "Question_Paper");

        res.download(filePath, fileName);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error generating PDF", error });
    }
};

export const downloadQuestionPDF = async (req,res) =>{
    
}
