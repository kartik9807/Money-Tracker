import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"


const connectDB = async()=>{
    try {
        await mongoose.connect(`${process.env.DB_URI}/${DB_NAME}`)
        console.log("Connected to MongoDB")
    } catch (err) {
        console.error(`MongoDB conenction failed ${err}`)
        throw err
    }
}

export default connectDB; 