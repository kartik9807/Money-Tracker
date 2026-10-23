import express from "express";
import { isLogedIn } from "../middlewares/auth.middleware.js";
import { addTransaction, deleteTransaction, editTransaction, getTransaction,toggleActive,editRecurringTransaction,deleteRecurringTransaction } from "../controllers/transaction.controller.js";

const router = express.Router();

router.route('/addTransaction').post(isLogedIn,addTransaction)
router.route('/getTransactions').get(isLogedIn,getTransaction)
router.route('/editTransaction/:id').patch(isLogedIn,editTransaction)
router.route('/removeTransaction/:id').delete(isLogedIn,deleteTransaction)
router.route('/toggleActive/:id').patch(isLogedIn,toggleActive)
router.route('/editRecurringTransaction/:id').patch(isLogedIn,editRecurringTransaction)
router.route('/removeRecurringTransaction/:id').delete(isLogedIn,deleteRecurringTransaction)

export default router;