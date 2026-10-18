import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import accountModel from "../models/account.model.js";

export const createAccount = asyncHandler(async(req,res)=>{
    const {name,type,balance} = req.body;
    console.log(req.body);
    if([name,type].some((fields)=>!fields?.trim())){
        throw new ApiError(400,"All fields are required");
    }
    const account = await accountModel.create({
        userId:req.user._id,
        name,
        type,
        balance
    })
    if(!account){
        throw new ApiError(400,"Failed to create account");
    }
    return res.status(200).json(new ApiResponse(200,account,"Account created Successfully"));
})

export const editAccount = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const {name,type,balance} = req.body;
    await accountModel.findByIdAndUpdate(id,{name,type,balance},{new:true});
    return res.status(200).json(new ApiResponse(200,"Account details updated successfully"))
})

export const getAccounts = asyncHandler(async(req,res)=>{
    const accounts = await accountModel.find({userId:req.user._id});
    if(!accounts){
        throw new ApiError(400,"No accounts found from this user");
    }
    return res.status(200).json(new ApiResponse(200,accounts,"all accounts fetched successfully"));
})

export const deleteAccount = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    await accountModel.findByIdAndDelete(id);
    return res.status(200).json(new ApiResponse(200,"Account details deleted successfully"))
})