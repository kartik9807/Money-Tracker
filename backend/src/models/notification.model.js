import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    category:{
        type:String,
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    message:{
        type:String,
        required:true,
    },
    read:{
        type:Boolean,
        default:false,
        required:true,
    }
},{timestamps:true})

export default mongoose.model("Notification",notificationSchema)