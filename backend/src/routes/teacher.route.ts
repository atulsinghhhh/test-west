import { Router } from "express"
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { generateQuestionAI } from "../controllers/teacher.controller.js";

const router = Router();


router.post("/question/generate", verifyJwt, generateQuestionAI);


export default router
