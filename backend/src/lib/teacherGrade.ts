import mongoose from "mongoose";
import { Grade } from "../models/grade.model.js";

export const ensureTeacherGradeFields = async (teacher: any) => {
    if (!teacher) return teacher;

    const hasGradeId = Boolean(teacher.gradeId);
    const hasGradeName = Boolean(teacher.gradeName);

    if (hasGradeId && hasGradeName) {
        if (!teacher.grade) {
            teacher.grade = teacher.gradeName;
            if (typeof teacher.save === "function") {
                await teacher.save();
            }
        }
        return teacher;
    }

    let gradeDoc = null;

    if (teacher.gradeId) {
        gradeDoc = await Grade.findOne({ _id: teacher.gradeId, schoolId: teacher.school });
    }

    if (!gradeDoc) {
        const legacyName = teacher.gradeName || teacher.grade;
        if (legacyName) {
            gradeDoc = await Grade.findOne({ gradeName: legacyName, schoolId: teacher.school });
        }

        if (!gradeDoc && legacyName) {
            gradeDoc = await Grade.findOneAndUpdate(
                { gradeName: legacyName, schoolId: teacher.school },
                { gradeName: legacyName, schoolId: teacher.school },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }
    }

    if (!gradeDoc) {
        throw new Error("Grade not found for teacher");
    }

    let dirty = false;

    if (!teacher.gradeId) {
        teacher.gradeId = new mongoose.Types.ObjectId(gradeDoc._id);
        dirty = true;
    }

    if (!teacher.gradeName) {
        teacher.gradeName = gradeDoc.gradeName;
        dirty = true;
    }

    if (!teacher.grade) {
        teacher.grade = gradeDoc.gradeName;
        dirty = true;
    }

    if (dirty && typeof teacher.save === "function") {
        await teacher.save();
    }

    return teacher;
};

