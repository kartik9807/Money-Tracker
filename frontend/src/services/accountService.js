import api from "./api.js";

export const createAccount = async(payload)=>{
    try {
        const response = await api.post('/account/create',payload);
        console.log("response from account service",response.data);
        return response.data;
    } catch (error) {   
        console.log("error creating the bank account",error);
        throw error;
    }
}

export const getAccounts = async()=>{
    try {
        const response = await api.get('/account/get');
        return response.data;
    } catch (error) {
        console.log("error in fetching the user bank accounts",error);
        throw error;
    }
}

export const updateAccount = async(id,payload)=>{
    try {
        const response = await api.patch(`/account/edit/${id}`,payload);
        return response.data;
    } catch (err) {
        console.log("error in updating the user bank account detail",err);
        throw err;
    }
}

export const deleteAccount = async(id)=>{
    try {
        const response = await api.delete(`/account/delete/${id}`);
        return response.data;
    } catch (err) {
        console.log("error in deleting the user bank account detail",err);
        throw err;
    }
}