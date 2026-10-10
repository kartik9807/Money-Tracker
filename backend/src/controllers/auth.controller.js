import {asyncHandler} from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import userModel from "../models/user.model.js"; 
import uploadOnCloudinary from "../utils/cloudinary.js";
import refreshTokenModel from "../models/refreshToken.model.js";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import ms from "ms";

var options = {
        httpOnly:true, // blocks client-side JavaScript from accessing the cookie
        secure:true // Requires HTTPS (highly recommended)
}
const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const generateAccessAndRefreshToken = async(userId,req)=>{
    try {
        const expiresAt = new Date(
            Date.now() + ms(process.env.REFRESH_TOKEN_EXPIRY)
        );
        
        const user = await userModel.findById(userId).select("-password");
        const sessionId = crypto.randomUUID();
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken(sessionId);
        console.log("data:- ",{
            accessToken,
            refreshToken,
            expiresAt,
            sessionId,
            userId
        })
        console.log("header",req.headers['user-agent'])
        const refreshModel = await refreshTokenModel.create({
            userId,
            tokenHash:crypto.createHash("sha256").update(refreshToken).digest("hex"),
            expiresAt,
            sessionId,
            deviceInfo:req.headers["user-agent"],
        })
        if(!refreshModel) throw new ApiError(500,"fail to create refresh token model");
        console.log("refreshModel",refreshModel)
        return {accessToken,refreshToken,refreshModel};
    } catch (error) {
        console.log(error)
        throw new ApiError(500,"Failed to generate access and refresh token")
    }
}

export const registerUser = asyncHandler(async (req,res)=>{
    const {username,fullname,email,password} = req.body;
    if([username,fullname,email,password].some((fields)=>!fields?.trim())){
        throw new ApiError(400,"All fields are required")
    }
    //? email validation
    if(!regex.test(email)){
        throw new ApiError(400,"Invalid email format")
    }

    //? existed user validation
    const existedUser = await userModel.findOne({$and:[{username},{email}]})
    if(existedUser){
        throw new ApiError(400,"user already existed please login");
    }
    console.log(req.files) 

    const avatarLocalPath = req.files?.avatar[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"avatar not found");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar){
        throw new ApiError(400,"fail to upload on cloudinary")
    }
    const user = await userModel.create({
        username,
        email,
        password,
        avatar:avatar?.url,
        fullname,
    })
    const newUser = await userModel.findById(user._id).select("-password");
    if(!newUser) throw new ApiError(400,"fail to create a new user");
    
    //? generating access and refresh token after user is registered
    const {accessToken,refreshToken,refreshModel} = await generateAccessAndRefreshToken(newUser._id,req);

    return res.status(201)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(201,newUser,"user created successfully"))
})

export const LoginUser = asyncHandler(async(req,res)=>{
    // const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    // if(token) throw new ApiError(400,"User already logged in, please logout first");

    const {username,email,password} = req.body;
    if([username,email,password].some(field=>!field?.trim())){
        throw new ApiError(400,"All fields are required");
    }
    if(!regex.test(email)){
        throw new ApiError(400,"Invalid email format");
    }
    const userCheck = await userModel.findOne({$and:[{email},{username}]});
    if(!userCheck) throw new ApiError(404,"user not found, please register first");
    
    const isPasswordValid = await userCheck.comparePassword(password);
    if(!isPasswordValid) throw new ApiError(404,"Enter password is incorrect")
    
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(userCheck._id,req);

    const loggedUser = await userModel.findById(userCheck._id).select('-password');

    return res
    .status(200)
    .cookie('accessToken',accessToken,options)
    .cookie('refreshToken',refreshToken,options)
    .json(
        new ApiResponse(200,{user:loggedUser},"User logged in successfully")
    )
});

export const LogoutOneDevice = asyncHandler(async(req,res)=>{
    const token = req.cookies?.refreshToken;
    if(!token) throw new ApiError(401,"Refresh token not found, please login");
    try {
        const decodedContent = await jwt.verify(token,process.env.REFRESH_TOKEN_KEY);
        const currentSessionToken = await refreshTokenModel.findOne({$and:[{userId:decodedContent._id},{sessionId:decodedContent.sessionId},{revokedAt:null},{expiresAt:{$gt:new Date()}}]});
        if(!currentSessionToken) throw new ApiError(401,"Invalid refresh token, please login");
        await refreshTokenModel.findByIdAndUpdate(currentSessionToken._id,{revokedAt:new Date()});
        return res.status(200)
        .cookie("accessToken","",{maxAge:0})
        .cookie("refreshToken","",{maxAge:0})
        .json(new ApiResponse(200,currentSessionToken.deviceInfo,"User logged out successfully"))
    
    } catch (error) {
        console.log(error);
        throw new ApiError(400,"Failed to logged out from the device")
    }
})

export const LogoutAllDevices = asyncHandler(async(req,res)=>{
    const token = req.cookies?.refreshToken;
    if(!token) throw new ApiError(401,"Refresh token not found, please login");
    try {
        const decodedContent = await jwt.verify(token,process.env.REFRESH_TOKEN_KEY);
        await refreshTokenModel.updateMany({userId:decodedContent._id}, {revokedAt: new Date()});
        return res.status(200)
        .cookie("accessToken","",{maxAge:0})
        .cookie("refreshToken","",{maxAge:0})
        .json(new ApiResponse(200,null,"User logged out from all devices successfully"))
    
    } catch (error) {
        console.log(error);
        throw new ApiError(400,"Failed to logout from All devices")

    }
})

export const generateNewAccessToken = asyncHandler(async(req,res)=>{
    const token = req.cookies?.refreshToken;
    if(!token) throw new ApiError(401,"Refresh token not found, please login");
    
    const decodedContent = await jwt.verify(token,process.env.REFRESH_TOKEN_KEY);
    const currentSessionToken = await refreshTokenModel.findOne({$and:[{userId:decodedContent._id},{sessionId:decodedContent.sessionId},{revokedAt:null},{expiresAt:{$gt:new Date()}}]});
    if(!currentSessionToken) throw new ApiError(401,"Invalid refresh token, please login");
    
    const user = await userModel.findById(decodedContent._id).select("-password");
    const newAccessToken = await user.generateAccessToken();
    
    return res.status(200)
    .cookie("accessToken",newAccessToken,options)
    .json(new ApiResponse(200,"New access token generated successfully"))
})

export const getUser = asyncHandler(async(req,res)=>{
    // console.log(req.user)
    const user = await userModel.findById(req.user._id).select("-password");
    return res.status(200).json(new ApiResponse(200,user,"user fetched successfully"))
})

export const editUser = asyncHandler(async(req,res)=>{
    const {fullname,username} = req.body;
    console.log("data",fullname,username);

    let avatar;
    if(req.files?.avatar?.length > 1){
        const avatarLocalPath = req.files?.avatar[0]?.path;
        console.log("avatarLocalPath",avatarLocalPath)
        if(!avatarLocalPath){
            throw new ApiError(400,"avatar not found");
        }
        avatar = await uploadOnCloudinary(avatarLocalPath);
        console.log("avatar",avatar)
        if(!avatar){
            throw new ApiError(400,"fail to upload on cloudinary")
        }
    }else{
        avatar = "undefined";
    }
    const updateFields = {
        fullname : (fullname !== "undefined")?fullname : req.user.fullname,
        username : (username !== "undefined")?username : req.user.username,
        avatar: (avatar !== "undefined")?avatar.url : req.user.avatar
    }
    console.log("updateFields",updateFields)
    await userModel.findByIdAndUpdate(req.user._id,{username:updateFields.username,fullname:updateFields.fullname,avatar:updateFields.avatar},{new:true});
    
    return res.status(200).json(new ApiResponse(200,"Updated the fields"));
})

export const changePassword = asyncHandler(async(req,res)=>{
    const {currentPassword,newPassword} = req.body;
    console.log("data",currentPassword,newPassword);

    const user = await userModel.findById(req.user._id);
    
    const isPasswordValid = await user.comparePassword(currentPassword);
    if(!isPasswordValid) throw new ApiError(400,"Current password is incorrect");

    user.password = newPassword;
    await user.save();

    return res.status(200).json(new ApiResponse(200,"Password updated successfully"));
})