import api from "./api.js";

export const LoginUser = async(credentials)=>{
    try {
        const response = await api.post('/users/login',credentials);
        return response.data;
    } catch (err) {
        console.log("Error in logging the user ",err);
        throw err;
    }
}

export const RegisterUser = async(credentials)=>{
    try {
        const response = await api.post('/users/register',credentials);
        return response.data;
    } catch (err) {
        console.log("Error in registering the User ",err);
        throw err;
    }
}

export const logoutDevice = async()=>{
    try {
        const response = await api.post('/users/logoutCurrent');
        return response.data;
    } catch (err) {
        console.log("Error is logout from this device ",err);
        throw err;
    }
}

export const logoutAll = async()=>{
    try {
        const response = await api.post('/users/logoutAll');
        return response.data;
    } catch (err) {
        console.log("Error is logout from this device ",err);
        throw err;
    }   
}

export const getUser = async()=>{
    try {
        const response = await api.get('/users/getUser');
        return response.data;
    } catch (err) {
        console.log("Failed to get the user ",err);
        throw err;
    }
}

export const refreshAccessToken = async()=>{
    try {
        const response = await api.get('/users/refresh');
        return response.data;
    } catch (err) {
        console.log("failed to get new access token ",err);
        throw err
    }
}

export const editUser = async(userData)=>{
    try {
        const response = await api.patch('/users/editUser',userData);
        return response.data;
    } catch (error) {
        console.log("Error in editing the user ",error);
        throw error;
    }
}

export const changePassword = async(payload)=>{
    try {
        const response = await api.patch('/users/changePassword',payload);
        return response.data;
    } catch (error) {
        console.log("Error in changing the password",error);
        throw error;
    }
}