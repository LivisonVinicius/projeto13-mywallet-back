import { Router } from 'express';
import { deposit, withdraw, records  } from '../controllers/transactionController.js';
import { tokenValidation } from '../middlewares/authMiddleware.js';
import { validateTransaction } from '../middlewares/transactionMiddleware.js';

const transactionRouter = Router();

transactionRouter.post("/deposit", tokenValidation, validateTransaction, deposit);
transactionRouter.post("/withdraw", tokenValidation, validateTransaction, withdraw);
transactionRouter.get("/records", tokenValidation, records);

export default transactionRouter;
