import { Router } from 'express'
import { userSignup } from '../controllers/user.controller.js';

const router = Router();

router.post("/signup",userSignup);


export default router;