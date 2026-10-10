import express from "express"
const router = express.Router()
import { upload } from "../middlewares/multer.middleware.js"

import { generateNewAccessToken, getUser, LoginUser,
        LogoutAllDevices, LogoutOneDevice, registerUser, editUser,changePassword } from "../controllers/auth.controller.js"
import { isLogedIn } from "../middlewares/auth.middleware.js"


router.route('/register').post(upload.fields([{
    name:'avatar',
    maxCount:1
}]),registerUser)
router.route('/login').post(LoginUser);
router.route('/logoutCurrent').post(isLogedIn,LogoutOneDevice);
router.route('/logoutAll').post(isLogedIn,LogoutAllDevices);
router.route('/refresh').get(generateNewAccessToken);
router.route('/getUser').get(isLogedIn,getUser);
router.route('/editUser').patch(isLogedIn,upload.fields([{
    name:'avatar',
    maxCount:1
}]),editUser);
router.route('/changePassword').patch(isLogedIn,changePassword)

export default router