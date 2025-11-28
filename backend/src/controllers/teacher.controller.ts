import { Question } from "../models/question.model.js";
import type { Response } from "express";
import type { RequestWithUser } from "./user.controller.js"
import { Teacher } from "../models/teacher.model.js";
import { School } from "../models/School.model.js";
import { Subject } from "../models/subject.model.js";
import { Chapter } from "../models/chapter.model.js";
import { Topic } from "../models/topic.model.js";
import { Subtopic } from "../models/subtopic.model.js";
import { genAI } from "../lib/ai.js";
import { ensureTeacherGradeFields } from "../lib/teacherGrade.js";
import { Paper } from "../models/paper.model.js";
import { PDFGenerate } from "../lib/pdfgenerate.js";
import { v4 as uuidv4 } from "uuid";
import { Grade } from "../models/grade.model.js";
import { Attempt } from "../models/attempt.model.js";

export const getTeacherQuota = async (req: RequestWithUser, res: Response) => {
    try {
        const teacherId = req.user?._id;

        if (!teacherId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Teacher not logged in"
            });
        }
        const teacher = await Teacher.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found"
            });
        }

        const remainingQuestions = teacher.questionSchoolLimit - teacher.questionSchoolCount;
        const remainingPapers = teacher.paperSchoolLimit - teacher.paperSchoolCount;

        return res.status(200).json({
            success: true,
            quota: {
                questionLimit: teacher.questionSchoolLimit,
                questionCount: teacher.questionSchoolCount,
                remainingQuestions,

                paperLimit: teacher.paperSchoolLimit,
                paperCount: teacher.paperSchoolCount,
                remainingPapers
            }
        });

    } catch (error) {
        console.error("Error fetching teacher quota:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

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

        const subtopics = await Subtopic.find({
            topicId,
            schoolId: teacher.school
        }).sort({ subtopicName: 1 });

        return res.status(200).json({ success: true, subtopics });
    } catch (error) {
        console.error("Error fetching teacher subtopics:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const fetchTeacherSchool = async (req: RequestWithUser, res: Response) => {
    try {
        const teacher = await Teacher.findById(req.user?._id).populate("school") as any;
        if (!teacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        return res.status(200).json({
            success: true,
            teacher: {
                name: teacher.name,
                school: {
                    _id: teacher.school._id,
                    name: teacher.school.name
                }
            }
        });


    } catch (error) {
        console.log("Error fetching teacher school:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const generateQuestionAI = async (req: RequestWithUser, res: Response) => {
    try {
        const { subjectId, chapterId, topicId, subtopicId, questionType, difficulty, noofQuestions } = req.body;
        const teacher = await getTeacherContext(req);
        const batchId = uuidv4();

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

        const subtopic = await Subtopic.findOne({
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
                School: ${school.name}
                Grade: ${teacher.gradeId}
                Subject: ${subject.subjectName}
                Chapter: ${chapter.chapterName}
                Topic: ${topic.topicName}
                Subtopic: ${subtopic.subtopicName}

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
                batchId,
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
            batchId: batchId,
            teacherQuestionUsed: teacher.questionSchoolCount,
            schoolRemainingLimit: updatedSchoolRemaining,
            schoolQuestionUsed: school.questionAdminCount
        });
    } catch (error) {
        console.error("AI Question Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const downloadQuestionPDF = async (req: RequestWithUser, res: Response) => {
    try {
        const { batchId } = req.params;

        console.log("Request batchId:", batchId);

        const questions = await Question.find({ batchId })
            .populate("schoolId")
            .populate("teacherId")
            .populate("gradeId")
            .populate("subjectId")
            .populate("chapterId")
            .populate("topicId")
            .populate("subtopicId");

        if (!questions || questions.length === 0) {
            return res.status(404).json({ success: false, message: "No questions found for this batch" });
        }

        const firstQ = questions[0];

        const school = firstQ.schoolId as any;
        const teacher = firstQ.teacherId as any;
        const grade = firstQ.gradeId as any;
        const subject = firstQ.subjectId as any;
        const chapter = firstQ.chapterId as any;
        const topic = firstQ.topicId as any;
        const subtopic = firstQ.subtopicId as any;

        let content = `
==========================================
            QUESTION PAPER
==========================================

School: ${school.name}
Teacher: ${teacher.name}
Grade: ${grade.gradeName}
Subject: ${subject.subjectName}
Chapter: ${chapter.chapterName}
Topic: ${topic.topicName}
Subtopic: ${subtopic?.subtopicName || "N/A"}

==========================================
`;

        questions.forEach((q: any, index: number) => {

            content += `
------------------------------------------
Q${index + 1}: ${q.questiontext}

Difficulty: ${q.difficulty.toUpperCase()}
Type: ${q.questionType.toUpperCase()}
------------------------------------------
`;

            if (q.options?.length > 0) {
                q.options.forEach((opt: string, idx: number) => {
                    content += `${idx + 1}. ${opt}\n`;
                });

                content += `Correct Answer: ${q.correctAnswer}\n`;
            } else {
                content += `Subjective Type (No Options)\n`;
            }

            content += `\n`;
        });

        const { filePath, fileName } = await PDFGenerate(content, `QuestionBatch_${batchId}`);

        console.log("PDF generated at:", filePath);

        return res.download(filePath, fileName);

    } catch (error: any) {
        console.log("Error Occurring: ", error);
        return res.status(500).json({
            success: false,
            message: "Error generating PDF",
            error: error instanceof Error ? error.message : error
        });
    }
};

export const generatepaperAI = async (req: RequestWithUser, res: Response) => {
    try {
        const {
            duration,
            totalMarks,
            totalQuestion,
            Instructions,
            paperType,
            testType,
            subjectId,
            chapterId,
            gradeId
        } = req.body;

        const teacher = await getTeacherContext(req);
        const paperId = uuidv4();

        const school = await School.findById(teacher.school);
        if (!school) {
            return res.status(404).json({ success: false, message: "School not found" });
        }
        console.log("School Name:", school.name);
        /** ------------------- VALIDATION ------------------- **/
        const requestedQuestions = Number(totalQuestion);
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

        if (!subject || !chapter) {
            return res.status(400).json({ success: false, message: "Invalid syllabus structure" });
        }


        /** ------------------- LIMIT VALIDATION ------------------- **/
        const teacherRemaining = teacher.paperSchoolLimit - teacher.paperSchoolCount;
        const schoolRemaining = school.paperAdminLimit - school.paperAdminCount;

        if (teacherRemaining < requestedQuestions) {
            return res.status(400).json({
                success: false,
                message: `Teacher limit exceeded. Remaining: ${teacherRemaining}`
            });
        }

        if (schoolRemaining < requestedQuestions) {
            return res.status(400).json({
                success: false,
                message: `School limit exceeded. Remaining: ${schoolRemaining}`
            });
        }

        /** ------------------- AI Prompt ------------------- **/
        const prompt = `
You are an expert question-paper generator for schools.

Generate a structured exam paper based on:

- Duration: ${duration} minutes
- Total Marks: ${totalMarks}
- Total Questions: ${totalQuestion}
- Instructions: ${Instructions}
- Paper Type: ${paperType}
- Test Type: ${testType}
- Subject Name: ${subject.subjectName}
- Chapter Name: ${chapter.chapterName}

Rules:
1. Use ONLY the given chapter.
2. Match EXACT total questions = ${totalQuestion}.
3. Match EXACT total marks = ${totalMarks}.
4. RETURN ONLY JSON. No markdown formatting, no explanation.
5. JSON Format:
[
    {
        "questionText": "Question text here",
        "options": ["Option A", "Option B", "Option C", "Option D"], // For MCQ
        "correctAnswer": "Correct Option or Answer",
        "type": "MCQ", // or "SHORT", "LONG"
        "marks": 1
    }
]
`;

        let result;
        try {
            result = await genAI.models.generateContent({
                model: "gemini-2.0-flash",
                contents: [{ parts: [{ text: prompt }] }],
            });
        } catch (apiError: any) {
            const statusCode = apiError?.status || apiError?.response?.status;
            const apiMessage =
                apiError?.error?.message || apiError?.message || "AI service error";

            if (statusCode === 429 || apiError?.error?.status === "RESOURCE_EXHAUSTED") {
                return res.status(429).json({
                    success: false,
                    message: apiMessage || "AI usage limit reached. Try later.",
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

        /** ------------------- SAVE PAPER ------------------- **/
        const paper = await Paper.create({
            teacherId: teacher._id,
            schoolId: school._id,
            duration,
            totalMarks,
            totalQuestion,
            Instructions,
            paperType,
            testType,
            paperId,
            subjectId,
            chapterId,
            questions: generatedQuestions, // Save structured questions
            gradeId: teacher.gradeId
        });

        /** ------------------- UPDATE LIMITS ------------------- **/
        teacher.paperSchoolCount += requestedQuestions;
        await teacher.save();

        school.paperAdminCount += requestedQuestions;
        await school.save();

        const teacherRemainingAfter = Math.max(
            teacher.paperSchoolLimit - teacher.paperSchoolCount,
            0
        );

        const schoolRemainingAfter = Math.max(
            school.paperAdminLimit - school.paperAdminCount,
            0
        );

        /** ------------------- RESPONSE ------------------- **/
        return res.status(200).json({
            success: true,
            message: "AI Paper generated successfully",
            paper,
            paperId,
            schoolId: {
                _id: school._id,
                name: school.name
            },
            teacherRemainingLimit: teacherRemainingAfter,
            schoolRemainingLimit: schoolRemainingAfter
        });

    } catch (error) {
        console.error("AI Paper Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const downloadPaperPDF = async (req, res) => {
    try {
        const { paperId } = req.params;
        console.log("Downloading paper with ID:", paperId);

        const paper = await Paper.find({ paperId })
            .populate("schoolId")
            .populate("teacherId")
            .populate("subjectId")
            .populate("chapterId");

        if (!paper) {
            return res
                .status(404)
                .json({ success: false, message: "Paper not found" });
        }

        const firstP = paper[0];
        const subject = firstP.subjectId as any;
        const chapter = firstP.chapterId as any;
        const school = firstP.schoolId as any;

        const content = `
    Exam Type: ${firstP.testType}
    Paper Type: ${firstP.paperType}
    Duration: ${firstP.duration} mins
    Total Marks: ${firstP.totalMarks}
    Total Questions: ${firstP.totalQuestion}

    Instructions:
    ${firstP.Instructions}

    -----------------------

    Subject: ${subject.subjectName}
    Chapter: ${chapter.chapterName}
    School: ${school?.name || "N/A"}

    -----------------------

    ${firstP.questions.map((question: any) => `Question: ${question.questionText}\nAnswer: ${question.userAnswer}\nCorrect Answer: ${question.correctAnswer}\n`).join("\n")}
    `;
        const { filePath, fileName } = await PDFGenerate(content, `Paper_${paperId}`);

        return res.download(filePath, fileName);
    } catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ success: false, message: "Error generating PDF", error });
    }
};

export const publishedQuestions = async (req: RequestWithUser, res: Response) => {
    try {
        const { batchId } = req.params;
        console.log("Publish batchId", batchId); 
        const teacher = await getTeacherContext(req);
        if (!teacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }
        // console.log("teacher Publish", teacher);

        const questions = await Question.find({ batchId, aiUsed: true });
        if (questions.length === 0) {
            return res.status(404).json({ success: false, message: "No questions found for this batch" });
        }
        const publishedQuestion = await Question.updateMany({ batchId, aiUsed: true }, { isPublish: true });
        return res.status(200).json({ success: true, message: "Questions published successfully", publishedCount: publishedQuestion.modifiedCount });
    } catch (error) {
        console.log("Error publishing questions:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const publishPaper = async (req: RequestWithUser, res: Response) => {
    try {
        const { paperId } = req.params;
        const teacher = await getTeacherContext(req);
        if (!teacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        const paper = await Paper.findOne({ paperId, teacherId: teacher._id });
        if (!paper) {
            return res.status(404).json({ success: false, message: "No paper found for this ID" });
        }

        paper.publishStatus = true;
        await paper.save();

        return res.status(200).json({ success: true, message: "Paper published successfully", paper });
    } catch (error) {
        console.log("Error publishing paper:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}


export const fetchQuestions = async (req: RequestWithUser, res: Response) => {
    try {
        const { batchId } = req.params;
        console.log("batchId", batchId);    
        const teacher = await getTeacherContext(req);
        if (!teacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }
        console.log("teacher", teacher);

        const matchStage: any = { teacherId: teacher._id };
        if (batchId) {
            matchStage.batchId = batchId;
        }

        const questions = await Question.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$batchId",
                    batchId: { $first: "$batchId" },
                    questionType: { $first: "$questionType" },
                    difficulty: { $first: "$difficulty" },
                    isPublish: { $first: "$isPublish" },
                    createdAt: { $first: "$createdAt" },
                    noofQuestion: { $sum: 1 }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        if (questions.length === 0) {
             return res.status(200).json({ success: true, questions: [] });
        }

        return res.status(200).json({ success: true, questions });
    } catch (error) {
        console.log("Error fetching questions:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const fetchStudentSubmissions = async (req: RequestWithUser, res: Response) => {
    try {
        const teacher = await getTeacherContext(req);
        
        // Fetch attempts for students in the teacher's grade/school
        // We can filter by gradeId to ensure relevance
        const attempts = await Attempt.find({ 
            gradeId: teacher.gradeId 
        })
        .populate("studentId", "name email")
        .populate("paperId", "paperType testType")
        .populate("subjectId", "subjectName")
        .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, attempts });
    } catch (error) {
        console.log("Error fetching student submissions:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const fetchClassAnalytics = async (req: RequestWithUser, res: Response) => {
    try {
        const teacher = await getTeacherContext(req);

        // Aggregate analytics
        const analytics = await Attempt.aggregate([
            { $match: { gradeId: teacher.gradeId } },
            {
                $group: {
                    _id: null,
                    totalAttempts: { $sum: 1 },
                    avgScore: { $avg: "$percentage" },
                    highestScore: { $max: "$percentage" },
                    lowestScore: { $min: "$percentage" }
                }
            }
        ]);

        const subjectAnalytics = await Attempt.aggregate([
            { $match: { gradeId: teacher.gradeId } },
            {
                $group: {
                    _id: "$subjectId",
                    avgScore: { $avg: "$percentage" },
                    totalAttempts: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "subjects",
                    localField: "_id",
                    foreignField: "_id",
                    as: "subject"
                }
            },
            { $unwind: "$subject" },
            {
                $project: {
                    subjectName: "$subject.subjectName",
                    avgScore: 1,
                    totalAttempts: 1
                }
            }
        ]);

        return res.status(200).json({ 
            success: true, 
            analytics: analytics[0] || { totalAttempts: 0, avgScore: 0, highestScore: 0, lowestScore: 0 },
            subjectAnalytics 
        });
    } catch (error) {
        console.log("Error fetching class analytics:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


export const fetchPapers = async (req: RequestWithUser, res: Response) => {
    try {
        const { paperId } = req.params;
        const teacher = await getTeacherContext(req);
        if (!teacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        if (paperId) {
            console.log("Fetching paper with ID:", paperId);
            const paper = await Paper.findOne({ paperId, teacherId: teacher._id });
            if (!paper) {
                return res.status(404).json({ success: false, message: "No paper found for this ID" });
            }

            return res.status(200).json({
                success: true, papers: {
                    paperId: paper.paperId,
                    testType: paper.testType,
                    paperType: paper.paperType,
                    totalQuestion: paper.totalQuestion,
                    totalMarks: paper.totalMarks,
                    publishStatus: paper.publishStatus || false // Ensure publishStatus is returned
                }
            });
        } else {
            console.log("Fetching all papers for teacher:", teacher._id);
            const papers = await Paper.find({ teacherId: teacher._id }).sort({ createdAt: -1 });

            const formattedPapers = papers.map(paper => ({
                paperId: paper.paperId,
                testType: paper.testType,
                paperType: paper.paperType,
                totalQuestion: paper.totalQuestion,
                totalMarks: paper.totalMarks,
                publishStatus: paper.publishStatus || false
            }));

            return res.status(200).json({ success: true, papers: formattedPapers });
        }

    } catch (error) {
        console.log("Error fetching paper:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

