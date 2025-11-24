import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { createSchool, getadminstats, getSchool } from "../controllers/admin.controller.js";

const router = Router();

router.post("/create",verifyJwt,createSchool);
router.get("/",verifyJwt,getSchool);
router.get("/stats",verifyJwt,getadminstats)


export default router;