import { asyncHandler } from "../utils/asyncHandler.js";
import notificationModel from "../models/notification.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";   

export const createNotification = asyncHandler(async(req,res)=>{
    const {type,title,message} = req.body;
    console.log("payload",type,title,message)
    if([type,title,message].some((fields)=>!fields?.trim())){
        throw new ApiError(400,"All fields are required")
    }
    const notification = await notificationModel.create({
        userId:req.user._id,
        category:type,
        title,
        message
    })
    return res.status(200).json(new ApiResponse(200,notification,"notification created successfully"))
})

export const readNotification = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    console.log(id);
    const notification = await notificationModel.findOne({_id: id,userId: req.user._id});
    console.log(notification)
    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }
    if (!notification.read) {
        notification.read = true;
        await notification.save();
    }
    return res.status(200).json(new ApiResponse(200, true, "Notification marked as read"));
})

export const deleteNotification = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const notification = await notificationModel.findOneAndDelete({_id:id,userId:req.user._id});
    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }
    return res.status(200).json(new ApiResponse(200,"Notification deleted successfully"))
})

export const deleteAllNotification = asyncHandler(async(req,res)=>{
    await notificationModel.deleteMany({userId:req.user._id});
    return res.status(200).json(new ApiResponse(200,"All notifications deleted successfully"));
})

export const getNotifications = asyncHandler(async(req,res)=>{
    const notifications = await notificationModel.find({userId:req.user._id}).sort({createdAt:-1});
    if(!notifications){
        throw new ApiError(400,"Error in fetching notifications");
    }
    console.log("notification from sever",notifications)
    return res.status(200).json(new ApiResponse(200,notifications,"Notifications fetched successfully"));
})