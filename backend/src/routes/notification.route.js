import express from "express";
import {isLogedIn} from "../middlewares/auth.middleware.js";
import {createNotification,deleteNotification,deleteAllNotification,readNotification, getNotifications} from "../controllers/notification.controller.js"

const router = express.Router()

router.route('/create').post(isLogedIn,createNotification);
router.route('/delete/:id').delete(isLogedIn,deleteNotification);
router.route('/deleteAll').delete(isLogedIn,deleteAllNotification)
router.route('/read/:id').patch(isLogedIn,readNotification);
router.route('/get').get(isLogedIn,getNotifications);

export default router