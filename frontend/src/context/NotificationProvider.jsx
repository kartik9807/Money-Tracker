import { useState,useEffect } from "react";
import { NotificationContext } from "./NotificationContext.jsx";
import { getNotifications } from "../services/notificationService.js";

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
    useEffect(() => {
        const init = async()=>{
            await checkNotifications();
        }
        init();
    }, [])
    return(
        <NotificationContext.Provider
            value={{notifications}}
        >
            {children}
        </NotificationContext.Provider>
    )
    
}