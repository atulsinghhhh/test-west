import express from "express";
import { 
    standaloneSignup, 
    standaloneLogin, 
    getDashboardAnalysis, 
    getAllPapers, 
    getAllQuizzes,
    attemptQuestionBatchStandalone,
    getPaperContentStandalone,
    attemptPaperStandalone,
    getQuestionsForBatchStandalone
} from "../controllers/standaloneStudent.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/signup", standaloneSignup);
router.post("/login", standaloneLogin);

// Protected routes
router.get("/dashboard-analysis", verifyJwt, getDashboardAnalysis);
router.get("/papers", verifyJwt, getAllPapers);
router.get("/paper/:paperId", verifyJwt, getPaperContentStandalone);
router.post("/attempt/paper/:paperId", verifyJwt, attemptPaperStandalone);
router.get("/quizzes", verifyJwt, getAllQuizzes);
router.get("/questions/:batchId", verifyJwt, getQuestionsForBatchStandalone);
router.post("/attempt/batch/:batchId", verifyJwt, attemptQuestionBatchStandalone);

export default router;
