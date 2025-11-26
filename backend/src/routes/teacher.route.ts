import { Router } from "express"
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { downloadPaperPDF, downloadQuestionPDF, fetchTeacherSchool, generatepaperAI, generateQuestionAI, getTeacherChapters, getTeacherGrade, getTeacherQuota, getTeacherSubjects, getTeacherSubtopics, getTeacherTopics } from "../controllers/teacher.controller.js";

const router = Router();

router.post("/question/generate", verifyJwt, generateQuestionAI);
router.get("/grade", verifyJwt, getTeacherGrade);
router.get("/quota",verifyJwt,getTeacherQuota)
router.get("/subjects", verifyJwt, getTeacherSubjects);
router.get("/subjects/:subjectId/chapters", verifyJwt, getTeacherChapters);
router.get("/chapters/:chapterId/topics", verifyJwt, getTeacherTopics);
router.get("/topics/:topicId/subtopics", verifyJwt, getTeacherSubtopics);
router.get("/question/download/:batchId",verifyJwt,downloadQuestionPDF);
router.get("/school/me",verifyJwt,fetchTeacherSchool)
// router.get("/question/download/:batchId", (req,res,next)=>{
//     console.log("ROUTE HIT");
//     next();
// }, verifyJwt, downloadQuestionPDF)



router.post("/paper/generate", verifyJwt,generatepaperAI)
router.get("/paper/download/:paperId", verifyJwt, downloadPaperPDF);

export default router
