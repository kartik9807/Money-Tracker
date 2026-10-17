import { useState,useEffect } from "react";
import { NotificationContext } from "./NotificationContext.jsx";
import { createNotification, getNotifications,deleteNotification,deleteAll, readNotification } from "../services/notificationService.js";

export const NotificationProvider = ({children})=>{
    const [notifications, setNotifications] = useState([])
    
    const checkNotifications = async()=>{
        try {
            const response = await getNotifications();
            if(response.success){
                setNotifications(response.data);
            }
        } catch (err) {
            setNotifications([])
        }
    }

    const getNotifcation = async()=>{
        try {
            const response = await getNotifications();
            if(response.success){
                setNotifications(response.data);
            }
        } catch (err) {
                setNotifications([])
        }
    }

    const addNotifications = async(payload)=>{
        try {
            const response = await createNotification(payload);

            //! notifications.push(response.data) this will not change the state of react it will just mutate the array 
            console.log("response from provider",response)
            if(response.success){
                setNotifications([...notifications,response.data])
            }
        } catch (error) {
            console.log("error in adding notification",error);
            throw error;
        }
    }

    const deleteNoti = async(id)=>{
        try {
            const response = await deleteNotification(id);
            if(response.success){
                setNotifications((prev)=>prev.filter((noti)=>noti._id !== id))
                console.log("notification from delete route",notifications);
            }
        } catch (error) {
            console.log("error in deleting notification",error);
            throw error;

        }
    }

    const deleteAllNotification = async()=>{
        try {
            const response = await deleteAll();
            if(response.success){
                setNotifications([]);
            }
        } catch (error) {
            console.log("error in deleting all notification",error);
            throw error;

        }
    }

    const readNoti = async(id)=>{
        try {
            const response = await readNotification(id);

            //! important mistake
            //* - map() — transform or update existing items.
            //* - filter() — remove items or keep only items matching a condition.

            //* setNotifications([...notifications], { readN.read: response.data })
            //* setNotifications() accepts one new state value, not two arguments. Also, readN is an array because you're using filter(), so readN.read won't work.
            
            if(response.success){
                setNotifications((prev)=>prev.map((noti)=>(noti._id === id)?{...noti,read:true}:noti));
                console.log("notification arr from read",notifications);
            }        
        } catch (error) {
            console.log("error in marking read notification",error);
            throw error;

        }
    } 

    useEffect(() => {
        const init = async()=>{
            await checkNotifications();
        }
        init();
    }, [])
    return(
        <NotificationContext.Provider
            value={{notifications,
                getNotifcation,
                addNotifications,
                deleteNoti,
                deleteAllNotification,
                readNoti}}
        >
            {children}
        </NotificationContext.Provider>
    )
    
}