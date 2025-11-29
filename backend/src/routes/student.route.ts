import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { 
    attemptPaper, 
    attemptQuestionBatch, 
    createPracticeQuiz, 
    fetchPaperContent, 
    fetchPublishedPapers, 
    fetchPublishedQuestions, 
    fetchQuestionSubmissions, 
    fetchQuestionsForBatch, 
    fetchStudentDashboardStats, 
    fetchStudentProfile, 
    fetchStudentsForSchool, 
    fetchStudentsForTeacher, 
    studentCreatedBySchool, 
    studentCreatedByTeacher, 
    submitPracticeQuiz, 
    viewBatchResult, 
    viewPaperResult 
} from "../controllers/student.controller.js";

const router = Router();

router.post("/school/create", verifyJwt, studentCreatedBySchool);
router.post("/teacher/create", verifyJwt, studentCreatedByTeacher);
router.get("/", verifyJwt, fetchStudentsForSchool);
router.get("/teacher/", verifyJwt, fetchStudentsForTeacher);

// Dashboard
router.get("/dashboard", verifyJwt, fetchStudentDashboardStats);
router.get("/me", verifyJwt, fetchStudentProfile);

// Practice
router.post("/practice/create", verifyJwt, createPracticeQuiz);
router.post("/practice/submit", verifyJwt, submitPracticeQuiz);

// Paper Routes
router.get("/papers/published", verifyJwt, fetchPublishedPapers);  //fix
router.get("/paper/:paperId/content", verifyJwt, fetchPaperContent); // fix
router.post("/paper/submit/:paperId", verifyJwt, attemptPaper); //fix
router.get("/paper/result/:paperId", verifyJwt, viewPaperResult);

// Question Batch Routes
router.get("/questions/published", verifyJwt, fetchPublishedQuestions);
router.get("/questions/:batchId", verifyJwt, fetchQuestionsForBatch);
router.post("/question/submit/:batchId", verifyJwt, attemptQuestionBatch);
router.get("/question/submissions", verifyJwt, fetchQuestionSubmissions);  // for teacher fetch the result
router.get("/question/result/:batchId", verifyJwt, viewBatchResult);

export default router;
