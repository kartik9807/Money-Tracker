import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    categoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true,
    },
    amount:{
        type:Number,
        required:true,
    },
    period:{
        type: String,
        enum: ["weekly", "monthly"],
        default: "monthly"
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    }
},{timestamps:true});

export default mongoose.model("Budget",budgetSchema);