import mongoose from "mongoose";

const refreshTokenSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    tokenHash:{
        type:String,
        required:true
    },
    expiresAt:{
        type:Date,
        required:true
    },
    revokedAt:{
        type:Date,
        default:null
    },
    deviceInfo:{
        type:String,
    },
    sessionId:{
        type:String,
        required:true,
        unique:true
    }
},{timestamps:true})

refreshTokenSchema.index(
    {expiresAt:1}, //? based on this timestamp
    {expireAfterSeconds:0,} //? Delete the document when the date stored in expiresAt has been reached.
);

export default mongoose.model("refreshToken",refreshTokenSchema)
    