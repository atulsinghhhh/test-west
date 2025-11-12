import { Router } from "express"
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { fetchTestSeries, getAllResults, getTestById, getTestResult, submitTest } from "../controllers/student.controller.js";

const router = Router();

router.get("/",verifyJwt,fetchTestSeries);
router.get("/test/:testId",verifyJwt,getTestById);
router.post("/tests/:testId/submit",verifyJwt,submitTest);
router.get("/results/:testId",verifyJwt,getTestResult);
router.get("/results",verifyJwt,getAllResults);


export default router