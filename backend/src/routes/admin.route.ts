import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware";
import { createSchool, getSchool } from "../controllers/admin.controller";

const router = Router();

router.post("/create",verifyJwt,createSchool);
router.get("/",verifyJwt,getSchool);


export default router;