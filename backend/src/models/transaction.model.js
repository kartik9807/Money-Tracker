import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    accountId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Account",
        required:function(){
            return this.paymentMethod !== "Cash";
        },
        
    },
    categoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true,
    },
    type:{
        type:String,
        enum:["income","expense","transfer"],
        required:true,
    },
    amount:{
        type:Number,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    transactionDate:{
        type:Date,
        required:true,
    },
    paymentMethod:{
        type:String,
        required:true,
    },
    isRecurring:{
        type:Boolean,
        default:false,
    },
    recurringTransactionId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"RecurringTransaction",
    }
},{timestamps:true})

export default mongoose.model("Transaction",transactionSchema);