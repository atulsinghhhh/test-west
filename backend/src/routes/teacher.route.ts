import { Router } from "express"
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { downloadPaperPDF, downloadQuestionPDF, fetchClassAnalytics, fetchPapers, fetchQuestions, fetchStudentSubmissions, fetchTeacherSchool, generatepaperAI, generateQuestionAI, getTeacherChapters, getTeacherGrade, getTeacherQuota, getTeacherSchoolGrades, getTeacherSubjects, getTeacherSubtopics, getTeacherTopics, publishedQuestions, publishPaper } from "../controllers/teacher.controller.js";

const router = Router();

router.get("/grade", verifyJwt, getTeacherGrade);
router.get("/school/grades", verifyJwt, getTeacherSchoolGrades);
router.get("/subjects", verifyJwt, getTeacherSubjects);
router.get("/subjects/:subjectId/chapters", verifyJwt, getTeacherChapters);
router.get("/chapters/:chapterId/topics", verifyJwt, getTeacherTopics);
router.get("/topics/:topicId/subtopics", verifyJwt, getTeacherSubtopics);

router.get("/school/me", verifyJwt, fetchTeacherSchool)
router.get("/quota", verifyJwt, getTeacherQuota)

// analytics routes
router.get("/analytics/submissions", verifyJwt, fetchStudentSubmissions);
router.get("/analytics/overview", verifyJwt, fetchClassAnalytics);

// question routes

router.post("/question/generate", verifyJwt, generateQuestionAI);
router.get("/question/download/:batchId", verifyJwt, downloadQuestionPDF);
router.get("/questions", verifyJwt, fetchQuestions);
router.put("/question/publish/:batchId", verifyJwt, publishedQuestions);


// paper routes
router.post("/paper/generate", verifyJwt, generatepaperAI)
router.get("/paper/download/:paperId", verifyJwt, downloadPaperPDF);
router.put("/paper/publish/:paperId", verifyJwt, publishPaper);
router.get("/papers", verifyJwt, fetchPapers);
router.get("/paper/:paperId", verifyJwt, fetchPapers);

export default router
