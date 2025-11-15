import { Router } from "express"
import { addTeachers, getTeacher } from "../controllers/school.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/add",verifyJwt,addTeachers)
router.get("/",verifyJwt,getTeacher)









export default router;