import { Router } from "express"
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { downloadPaperPDF, downloadQuestionPDF, generatepaperAI, generateQuestionAI, getTeacherChapters, getTeacherGrade, getTeacherSubjects, getTeacherSubtopics, getTeacherTopics } from "../controllers/teacher.controller.js";

const router = Router();

router.post("/question/generate", verifyJwt, generateQuestionAI);
router.get("/grade", verifyJwt, getTeacherGrade);
router.get("/subjects", verifyJwt, getTeacherSubjects);
router.get("/subjects/:subjectId/chapters", verifyJwt, getTeacherChapters);
router.get("/chapters/:chapterId/topics", verifyJwt, getTeacherTopics);
router.get("/topics/:topicId/subtopics", verifyJwt, getTeacherSubtopics);
// router.get("/question/download/:questionId",verifyJwt,downloadQuestionPDF)
router.get("/question/download/:batchId", (req,res,next)=>{
    console.log("ROUTE HIT");
    next();
}, verifyJwt, downloadQuestionPDF)



router.post("/paper/generate", verifyJwt,generatepaperAI)
router.get("/paper/:paperId/download", verifyJwt, downloadPaperPDF);

export default router
