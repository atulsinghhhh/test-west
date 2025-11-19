import type { Response } from "express";
import { School } from "../models/School.model.js";
import { Teacher } from "../models/teacher.model.js";
import type { RequestWithUser } from "./user.controller.js"
import { Grade } from "../models/grade.model.js";
import { Chapter } from "../models/chapter.model.js";
import { Subject } from "../models/subject.model.js";
import { Topic } from "../models/topic.model.js"
import { subTopic } from "../models/subtopic.model.js";


export const addTeachers = async (req: RequestWithUser, res: Response) => {
    try {
        const schoolId = req.user?._id;
        const { name, email, password, grade, questionSchoolLimit, paperSchoolLimit } = req.body;
        if (!name || !email || !password || !grade || !paperSchoolLimit || !questionSchoolLimit) {
            return res.status(400).json({ success: false, message: "all fields are required" });
        }

        const newTeacher = await Teacher.create({
            name,
            email,
            password,
            grade,
            questionSchoolLimit,
            paperSchoolLimit,
            school: schoolId,

            questionSchoolCount: 0,
            paperSchoolCount: 0
        })
        if (!newTeacher) {
            return res.status(400).json({ success: false, message: "failed to created the new School" });
        }

        await School.findByIdAndUpdate(schoolId, {
            $push: { teachers: newTeacher._id }
        })


        const remainingQuestions = newTeacher.questionSchoolLimit - newTeacher.questionSchoolCount;
        const remainingPapers = newTeacher.paperSchoolLimit - newTeacher.paperSchoolCount;

        res.status(200).json({
            success: true, message: "successfully created new teacher",
            teacher: {
                _id: newTeacher._id,
                name: newTeacher.name,
                email: newTeacher.email,
                grade: newTeacher.grade,
                school: schoolId,

                questionLimit: newTeacher.questionSchoolLimit,
                paperLimit: newTeacher.paperSchoolLimit,

                questionCount: newTeacher.questionSchoolCount,
                paperCount: newTeacher.paperSchoolCount,

                remainingQuestions,
                remainingPapers
            }
        });
    } catch (error) {
        console.log("Error Occuring due to: ", error);
        return res.status(500).json({ Success: false, message: "Internal server issue" });
    }
}

export const getTeacher = async (req: RequestWithUser, res: Response) => {
    try {
        const schoolId = req.user?._id;
        console.log("SchoolId: ", schoolId);

        const teachers = await Teacher.find({ school: schoolId }).select("-password");
        if (!teachers) {
            return res.status(404).json({ success: false, message: "school not found" })
        }
        console.log("Teacher: ", teachers);

        res.status(200).json({ success: true, message: "fetch Teachers that created by School", teachers });
    } catch (error) {
        console.log("Error Occuring due to: ", error);
        return res.status(500).json({ Success: false, message: "Internal server issue" });
    }
}

export const addGrade = async (req: RequestWithUser, res: Response) => {
    try {
        const { gradeName } = req.body;
        if (!gradeName) {
            return res.status(400).json({ success: false, message: "gradeName is required field" });
        }

        const newGrade = await Grade.create({
            gradeName,
            schoolId: req.user?._id
        })
        if (!newGrade) {
            return res.status(400).json({ success: false, message: "failed to add grade" })
        }

        res.status(200).json({ success: true, message: "successfully added grade", newGrade })
    } catch (error) {
        console.log("Error Occuring due to: ", error);
        return res.status(500).json({ Success: false, message: "Internal server issue" });
    }
}

export const getGrade = async (req: RequestWithUser, res: Response) => {
    try {
        const schoolId = req.user?._id;

        const grades = await Grade.find({ schoolId }).sort({ gradeName: 1 });

        return res.status(200).json({ success: true, grades });
    } catch (error) {
        console.error("Error fetching grades:", error);
        return res.status(500).json({ Success: false, message: "Internal server issue" });
    }
}

export const addChapters = async (req: RequestWithUser, res: Response) => {
    try {
        const { chapterName } = req.body;
        const schoolId = req.user?._id;
        const { subjectId } = req.params;

        if (!chapterName) {
            return res.status(400).json({ success: false, message: "chapter name is required field" });
        }

        const newChapter = await Chapter.create({
            chapterName,
            schoolId: schoolId,
            subjectId: subjectId
        })

        if (!newChapter) {
            return res.status(400).json({ success: false, message: "failed to created new chapter" });
        }

        res.status(200).json({ success: true, message: "successfully created a new chapter", newChapter })
    } catch (error) {
        console.log("Error Occuring due to: ", error);
        return res.status(500).json({ Success: false, message: "Internal server issue" });
    }
}

export const getChapters = async (req: RequestWithUser, res: Response) => {
    try {
        const { subjectId } = req.params;
        const schoolId = req.user?._id;

        const chapters = await Chapter.find({ subjectId, schoolId }).sort({ chapterName: 1 });
        if (!chapters) {
            return res.status(400).json({ success: false, message: "failed to fetch the chapter" });
        }

        res.status(200).json({ success: true, chapters })
    } catch (error) {
        console.error("Error fetching chapter:", error);
        return res.status(500).json({ Success: false, message: "Internal server issue" });
    }
}

export const deleteChapter = async (req: RequestWithUser, res: Response) => {
    try {

    } catch (error) {

    }
}

export const addSubject = async (req: RequestWithUser, res: Response) => {
    try {
        const { subjectName } = req.body;
        const schoolId = req.user?._id;
        const { gradeId } = req.params;

        if (!subjectName) {
            return res.status(200).json({ success: false, message: "subject fields are required" })
        }

        const newSubject = await Subject.create({
            subjectName,
            schoolId: schoolId,
            gradeId: gradeId
        })

        if (!newSubject) {
            return res.status(400).json({ success: false, message: "failed to created new subject" });
        }

        res.status(200).json({ success: true, message: "created a new subject", newSubject })
    } catch (error) {
        console.log("Error Occuring due to: ", error);
        return res.status(500).json({ Success: false, message: "Internal server issue" });
    }
}

export const getSubjects = async (req: RequestWithUser, res: Response) => {
    try {
        const { gradeId } = req.params;
        const schoolId = req.user?._id;

        const subjects = await Subject.find({ gradeId, schoolId }).sort({ subjectName: 1 });
        if (!subjects) {
            return res.status(400).json({ success: false, message: "failed to fetch the subject" });
        }
        console.log("Subjects: ", subjects);

        res.status(200).json({ success: true, subjects });
    } catch (error) {
        console.error("Error fetching subject:", error);
        return res.status(500).json({ Success: false, message: "Internal server issue" });
    }
}

export const deleteSubject = async (req: RequestWithUser, res: Response) => {
    try {

    } catch (error) {

    }
}

export const addTopic = async (req: RequestWithUser, res: Response) => {
    try {
        const { chapterId } = req.params;
        const { topicName } = req.body;
        const schoolId = req.user?._id;

        const newTopic = await Topic.create({
            schoolId: schoolId,
            chapterId: chapterId,
            topicName
        })

        if (!newTopic) {
            return res.status(400).json({ success: false, message: "failed to created new topic" });
        }

        res.status(200).json({ success: true, message: "added a new topic", newTopic })
    } catch (error) {
        console.log("Error Occuring due to: ", error);
        return res.status(500).json({ Success: false, message: "Internal server issue" });
    }
}

export const getTopic = async (req: RequestWithUser, res: Response) => {
    try {
        const { chapterId } = req.params;
        const schoolId = req.user?._id;

        const topics = await Topic.find({ chapterId, schoolId });
        if (!topics) {
            return res.status(400).json({ success: false, message: "failed to fetch the subject" });
        }

        res.status(200).json({ success: true, topics })

    } catch (error) {
        console.error("Error fetching topic:", error);
        return res.status(500).json({ Success: false, message: "Internal server issue" });
    }
}

export const deleteTopic = async (req: RequestWithUser, res: Response) => {
    try {

    } catch (error) {

    }
}


export const addSubtopic = async (req: RequestWithUser, res: Response) => {
    try {
        const { topicId } = req.params;
        const { subtopicName } = req.body;
        const schoolId = req.user?._id;

        const newSubtopic = await subTopic.create({
            schoolId: schoolId,
            topicId: topicId,
            subtopicName
        });

        if (!newSubtopic) {
            return res.status(400).json({ success: false, message: "Failed to create new subtopic" });
        }

        return res.status(200).json({ success: true, message: "Added a new subtopic", newSubtopic });

    } catch (error) {
        console.log("Error Occuring due to:", error);
        return res.status(500).json({ success: false, message: "Internal server issue" });
    }
};

export const getSubtopics = async (req: RequestWithUser, res: Response) => {
    try {
        const { topicId } = req.params;
        const schoolId = req.user?._id;

        const subtopics = await subTopic.find({ topicId, schoolId });

        if (!subtopics) {
            return res.status(400).json({ success: false, message: "Failed to fetch subtopics" });
        }

        return res.status(200).json({ success: true, subtopics });

    } catch (error) {
        console.error("Error fetching subtopics:", error);
        return res.status(500).json({ success: false, message: "Internal server issue" });
    }
};


export const deleteSubtopic = async (req: RequestWithUser, res: Response) => {
    try {
        const { subtopicId } = req.params;
        const schoolId = req.user?._id;

        const subtopic = await subTopic.findOne({ _id: subtopicId, schoolId });
        if (!subtopic) {
            return res.status(404).json({ success: false, message: "Subtopic not found or unauthorized" });
        }

        await subTopic.deleteOne({ _id: subtopicId });

        return res.status(200).json({ success: true, message: "Subtopic deleted successfully" });

    } catch (error) {
        console.log("Error deleting subtopic:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

