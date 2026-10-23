import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import transactionModel from "../models/transaction.model.js";
import recurringModel from "../models/recurringTransaction.model.js"
import categoryModel from "../models/category.model.js";

function calculateNextRun(startDate,frequency){
    const date = new Date(startDate);
    switch(frequency){
        case "daily":
            date.setDate(date.getDate() + 1);
            break;
        case "weekly":
            date.setDate(date.getDate() + 7);
            break;
        case "monthly":
            date.setMonth(date.getMonth() + 1);
            break;
        case "yearly":
            date.setFullYear(date.getFullYear() + 1);
            break;
        default:
            throw new ApiError(400,"Invalid frequency");
    }
    return date;
}

const findOrCreateCategory = async (userId, name, type) => {
    let category = await categoryModel.findOne({
        userId,
        name,
        type,
    });

    if (!category) {
        category = await categoryModel.create({
            userId,
            name,
            type,
        });
    }

    return category;
};

export const addTransaction = asyncHandler(async(req,res)=>{
    const {isRecurring,...data} = req.body;
    
    //? creating category model
    const category = await findOrCreateCategory(
        req.user._id,
        data.category,
        data.type
    );
    
    if(isRecurring){
        const nextrun = calculateNextRun(data.startDate,data.frequency)
        console.log(nextrun)
        //? creating the recurrsive transaction
        const recurringTransaction = await recurringModel.create({
            userId:req.user._id,
            ...data,
            categoryId:category._id,
            nextRunAt:nextrun,
        })
        const transaction = await transactionModel.create({
            userId:req.user._id,
            ...data,
            categoryId:category._id,
            isRecurring:true,
            recurringTransactionId:recurringTransaction._id
        })
        await transaction.populate('categoryId recurringTransactionId')
        console.log("recurringtransaction",recurringTransaction);
        console.log("transaction",transaction);
        if(!recurringTransaction) throw new ApiError(400,"Recurring transaction creation failed ");
        return res.status(200).json(new ApiResponse(200,transaction,"recurring transaction created successfully"))
    
    }else{
        //? creating the transaction where isRecurring is false;
        const transaction = await transactionModel.create({
            userId:req.user._id,
            ...data,
            categoryId:category._id,
        })

        await transaction.populate('categoryId');
        console.log(transaction); 
        
        if(!transaction) throw new ApiError(400,"Transaction creation failed")
        return res.status(200).json(new ApiResponse(200,transaction,"Transaction created successfully"))
    }
})

export const getTransaction = asyncHandler(async(req,res)=>{
    const transactions = await transactionModel.find({userId:req.user._id}).populate('categoryId recurringTransactionId');
    if(!transactions) throw new ApiError(400,"No transactions found");
    return res.status(200).json(new ApiResponse(200,transactions,"All transaction fetched successfully"));
})

export const editTransaction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {category:categoryName,...data} = req.body;

    //? Finding the transaction
    const existingTransaction = await transactionModel.findOne({
        _id: id,
        userId: req.user._id,
    });

    if (!existingTransaction) {
        throw new ApiError(404, "Transaction not found");
    }

    //? Finding or creating the selected category
    let category = existingTransaction.categoryId;
    if (categoryName && (!category || String(category.name) !== categoryName || data.type !== existingTransaction.type)) {
        category = await findOrCreateCategory(
            req.user._id,
            categoryName,
            data.type ?? existingTransaction.type
        );
    }

    //? Updating the transaction
    console.log("existing transaction",existingTransaction)
    const updatedTransaction = await transactionModel.findOneAndUpdate({_id: id,userId: req.user._id,},{...data,categoryId: category?._id ?? category,},{new: true}).populate('categoryId recurringTransactionId');

    //? Update shared details in the recurring rule, if applicable
    if (existingTransaction.recurringTransactionId) {
        const recurringId =
            existingTransaction.recurringTransactionId._id ??
            existingTransaction.recurringTransactionId;

        const recurringUpdates = {};

        const editableFields = [
            "type",
            "amount",
            "description",
            "accountId",
            "paymentMethod",
        ];

        for (const field of editableFields) {
            if (data[field] !== undefined) {
                recurringUpdates[field] = data[field];
            }
        }

        recurringUpdates.categoryId = category?._id ?? category;

        await recurringModel.findOneAndUpdate(
            {
                _id: recurringId,
                userId: req.user._id,
            },
            recurringUpdates,
            {
                new: true,
                runValidators: true,
            }
        );
    }

    // await updatedTransaction.populate("categoryId recurringTransactionId");
    console.log(updatedTransaction)
    return res.status(200).json(new ApiResponse(200,updatedTransaction,"Transaction updated successfully"));
});

export const editRecurringTransaction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {category: categoryName,...data} = req.body;

    const recurring = await recurringModel.findOne({_id: id,userId: req.user._id,});
    if (!recurring) {throw new ApiError(404, "Recurring transaction not found");}

    const existingTransaction = await transactionModel.findOne({userId: req.user._id,recurringTransactionId: recurring._id,});
    if (!existingTransaction) {throw new ApiError(404,"Associated transaction not found");}

    const category = await findOrCreateCategory(
        req.user._id,
        categoryName,
        data.type ?? recurring.type
    );

    const nextRunAt = calculateNextRun(
        recurring.startDate,
        data.frequency ?? recurring.frequency
    );

    await recurringModel.findOneAndUpdate({_id: id,userId: req.user._id,},{...data,categoryId: category._id,nextRunAt,},{new: true,runValidators: true,});

    const updatedTransaction = await transactionModel.findOneAndUpdate({_id: existingTransaction._id,userId: req.user._id,},{...data,categoryId: category._id,},{new: true,runValidators: true,});
    await updatedTransaction.populate([{ path: "categoryId" },{ path: "recurringTransactionId" },]);

    return res.status(200).json(new ApiResponse(200,updatedTransaction,"Recurring transaction updated successfully"));
});

export const deleteTransaction = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const transaction = await transactionModel.findOne({_id:id,userId:req.user._id});
    if(transaction && transaction.recurringTransactionId?._id){
        await recurringModel.findByIdAndDelete(transaction.recurringTransactionId._id)
    }
    await transaction.deleteOne();
    return res.status(200).json(new ApiResponse(200,"deleted successfully"));
})

export const deleteRecurringTransaction = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const transaction = await transactionModel.findOne({userId:req.user._id,recurringTransactionId:id});
    await recurringModel.findByIdAndDelete(id);
    await transaction.deleteOne();
    return res.status(200).json(new ApiResponse(200,"deleted successfully"));
})

export const toggleActive = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    console.log(id,req.body)
    const {isActive} = req.body;

    const transaction = await recurringModel.findById(id);
    if(!transaction) throw new ApiError(400,`failed to fetch the recurring transaction corresponding to this ${id}`)
    
    transaction.isActive = isActive;
    await transaction.save();

    return res.status(200).json(new ApiResponse(200,"recurring state updated successfully"));
})