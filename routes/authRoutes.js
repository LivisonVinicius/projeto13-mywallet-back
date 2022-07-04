import { Router } from 'express';
import { registerF, login } from '../controllers/authController.js';
import { userValidation, loginValidation, registerValidation } from '../middlewares/authMiddleware.js';


const authRouter = Router();

authRouter.post("/login",  loginValidation, login);
authRouter.post("/register", userValidation, registerValidation, registerF);

export default authRouter;