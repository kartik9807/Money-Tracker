import express from "express"
import { isLogedIn } from "../middlewares/auth.middleware.js"
import { createAccount, deleteAccount, editAccount, getAccounts } from "../controllers/account.controller.js";
const router = express.Router();

router.route('/create').post(isLogedIn,createAccount);
router.route('/get').get(isLogedIn,getAccounts);
router.route('/edit/:id').patch(isLogedIn,editAccount)
router.route('/delete/:id').delete(isLogedIn,deleteAccount)

export default router