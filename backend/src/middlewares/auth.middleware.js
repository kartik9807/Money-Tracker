import userModel from "../models/user.model.js";   
import jwt from 'jsonwebtoken'
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import refreshTokenModel from "../models/refreshToken.model.js";

export const isLogedIn = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
        if(!token) throw new ApiError(401,"Access token not found, please login");
        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_KEY);
        if(!decoded) throw new ApiError(401,"Invalid access token, please login");
        const user = await userModel.findById(decoded._id).select("-password");
        if(!user) throw new ApiError(401,"User not found, please login");
        
        //? session check if user is loged in from multiple devices then we will check if the session is valid or not 
        const session = await refreshTokenModel.findOne({userId:decoded._id,revokedAt:null,expiresAt:{$gt:new Date()}});
        if(!session) throw new ApiError(401,"Session expired, please login");
        
        req.user = user;
        next();
    } catch (err) {
        throw new ApiError(401,err?.message || "Invalid Access Token")
    }
})