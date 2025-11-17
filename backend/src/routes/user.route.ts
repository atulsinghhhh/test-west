import { Router } from 'express'
import { getProfile, userLogin, userLogout, AdminSignup } from '../controllers/user.controller';
import { verifyJwt } from '../middlewares/auth.middleware';

const router = Router();

router.post("/signup",AdminSignup);
router.post("/login",userLogin);
router.post("/logout",userLogout);
router.get("/me",verifyJwt,getProfile);


export default router;