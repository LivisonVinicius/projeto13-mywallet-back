import { Router } from "express";
import  authRouter from "./authRoutes.js";
import transactionRouter from "./transactionRoutes.js";

const router = Router();
router.use(authRouter);
router.use(transactionRouter);

export default router;
