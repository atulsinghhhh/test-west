import { Router } from "express"
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { downloadPaperPDF, generatepaperAI, generateQuestionAI, getTeacherChapters, getTeacherGrade, getTeacherSubjects, getTeacherSubtopics, getTeacherTopics } from "../controllers/teacher.controller.js";

const router = Router();

router.get("/grade", verifyJwt, getTeacherGrade);
router.get("/subjects", verifyJwt, getTeacherSubjects);
router.get("/subjects/:subjectId/chapters", verifyJwt, getTeacherChapters);
router.get("/chapters/:chapterId/topics", verifyJwt, getTeacherTopics);
router.get("/topics/:topicId/subtopics", verifyJwt, getTeacherSubtopics);

router.post("/question/generate", verifyJwt, generateQuestionAI);
router.post("/paper/generate", verifyJwt,generatepaperAI)
router.get("/paper/:paperId/download", verifyJwt, downloadPaperPDF);

export default router
