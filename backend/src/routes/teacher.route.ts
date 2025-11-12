import { Router } from "express"
import { addQuestion, createTest, deletedTest, getTeachersTest, publishTest } from "../controllers/teacher.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("tests/create",verifyJwt,createTest)
router.post("/tests/:testId",verifyJwt,addQuestion);
router.put("/tests/:testId/publish",verifyJwt,publishTest);
router.get("/tests",verifyJwt,getTeachersTest);
router.delete("/tests/:testId",verifyJwt,deletedTest);

export default router