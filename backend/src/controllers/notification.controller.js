import { asyncHandler } from "../utils/asyncHandler.js";
import notificationModel from "../models/notification.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";   

export const createNotification = asyncHandler(async(req,res)=>{
    const {type,title,message,read} = req.body;
    if([type,title,message,read].some((fields)=>!fields?.trim())){
        throw new ApiError(400,"All fields are required")
    }
    const notification = await notificationModel.create({
        userId:req.user._id,
        category:type,
        title,
        message,
        read
    })
    return res.status(200).json(new ApiResponse(200,notification,"notification created successfully"))
})

export const readNotification = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const notification = await notificationModel.findById(id);
    if(notification.read == false){
        notification.read = true;
        await notification.save();
        return res.status(200).json(new ApiResponse(200,"notification marked as read"));
    }
    notification.read = false;
    await notification.save();
    return res.status(200).json(new ApiResponse(200,"notification marked as unread"));
})

export const deleteNotification = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const notification = await notificationModel.findOneAndDelete({_id:id,userId:req.user._id});
    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }
    return res.status(200).json(new ApiResponse(200,"Notification deleted successfully"))
})

export const deleteAllNotification = asyncHandler(async(_,res)=>{
    await notificationModel.deleteMany({userId:req.user._id});
    return res.status(200).json(new ApiResponse(200,"All notifications deleted successfully"));
})

export const getNotifications = asyncHandler(async(_,res)=>{
    const notifications = await notificationModel.find({$and:[{userId:req.user._id},{read:true}]}).sort({createdAt:-1});
    return res.status(200).json(new ApiResponse(200,notifications,"Notifications fetched successfully"));
})