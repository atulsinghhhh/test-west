import { Router } from 'express'
import { getProfile, userLogin, userLogout, AdminSignup } from '../controllers/user.controller.js';
import { verifyJwt } from '../middlewares/auth.middleware.js';

const router = Router();

router.post("/signup",AdminSignup);
router.post("/login",userLogin);
router.post("/logout",userLogout);
router.get("/me",verifyJwt,getProfile);


export default router;