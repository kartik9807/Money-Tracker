import api from "./api.js";

export const getNotifications = async()=>{
    try {
        const response = await api.get('/notifications/get');
        return response.data;
    } catch (err) {
        console.log("error in getting notifications",err);
        throw err;
    }
}

export const deleteNotification = async(id)=>{
    try {
        const response = await api.delete(`/notifications/delete/:${id}`);
        return response.data;
    } catch (err) {
        console.log("error in deleting notifications",err);
        throw err;
    }
}

export const deleteAll = async()=>{
    try {
        const response = await api.delete('/notifications/deleteAll');
        return response.data;
    } catch (err) {
        console.log("error in deleting all notifications",err);
        throw err;
    }
}

export const createNotification = async(payload)=>{
    try {
        const response = await api.create('/notifications/create',payload);
        return response.data;
    } catch (err) {
        console.log("error in creating the notification",err);
        throw err;
    }
}

export const readNotification = async(id)=>{
    try {
        const response = await api.patch(`/notifications/read/:${id}`);
        return response.data;
    } catch (err) {
        console.log("error in toggling the read function",err);
        throw err;
    }
}