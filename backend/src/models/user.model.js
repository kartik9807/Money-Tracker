import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        index:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true,
    },
    password:{
        type:String,
        require:[true,'password is required'],
    },
    avatar:{
        type:String, // cloudinary link
        default:"https://shorturl.at/YLLar" // dummy user profile pic
    }
},{timestamps:true})

userSchema.pre('save',async function(){
    if(!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
})
userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password);
}
userSchema.methods.generateAccessToken = function() {
    return jwt.sign({
        _id:this._id,
        username:this.username,
        email:this.email,
        fullname:this.fullname
    },process.env.ACCESS_TOKEN_KEY,{
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
}
userSchema.methods.generateRefreshToken = function(sessionId) {
    return jwt.sign({
        _id:this._id,
        sessionId:sessionId
    },process.env.REFRESH_TOKEN_KEY,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
}
export default mongoose.model("User",userSchema)