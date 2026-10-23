import api from "./api";

export const createTransaction = async(payload)=>{
    try {
        console.log("payload coming in transaction services",payload)
        const response = await api.post('/transactions/addTransaction',payload);
        return response.data;
    } catch (err) {
        console.log("error in creating the transaction",err);
        throw err;
    }
}

export const getTransactions = async()=>{
    try {
        const response = await api.get('/transactions/getTransactions');
        return response.data;
    } catch (err) {
        console.log("error in getting the transactions",err);
        throw err;
    }
}

export const updateTransaction = async(id,payload)=>{
    try {
        const response  = await api.patch(`/transactions/editTransaction/${id}`,payload);
        return response.data;
    } catch (err) {
        console.log("error in editing the transaction",err);
        throw err;
    }
}

export const updateRecurringTransaction = async(id,payload)=>{
    try {
        const response = await api.patch(`/transactions/editRecurringTransaction/${id}`,payload);
        return response.data;
    } catch (err) {
        console.log("error in editing the recurring transaction",err);
        throw err;
    }
}

export const deleteTransaction = async(id)=>{
    try {
        const response = await api.delete(`/transactions/removeTransaction/${id}`);
        return response.data;
    } catch (err) {
        console.log("error in removing the transaction",err);
        throw err;
    }
}

export const deleteRecurring = async(id)=>{
    try {
        const response = await api.delete(`/transactions/removeRecurringTransaction/${id}`);
        return response.data;
    } catch (err) {
        console.log("error in removing the transaction",err);
        throw err;
    }
}

export const toggleActiveState = async(id,payload)=>{
    try {
        console.log("active from transactionService",payload);
        const response = await api.patch(`/transactions/toggleActive/${id}`,payload);
        return response.data;
    } catch (err) {
        console.log("error in toggling the active state",err);
        throw err;
    }
}