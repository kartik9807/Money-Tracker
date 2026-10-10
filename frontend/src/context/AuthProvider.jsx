import { useState,useEffect } from "react";
import { AuthContext } from "./AuthContext.jsx";
import { getUser,refreshAccessToken } from "../services/authService.js";
import { LoginUser,RegisterUser,logoutDevice,logoutAll } from "../services/authService.js";

export const AuthProvider = ({children})=>{
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const checkSession = async()=>{
        try {
            const response = await getUser();
            if(response.success){
                setUser(response.data);
            }
        } catch (err) {
            //? if user is null then we will check for the refresh token and get new access token
            //? if refresh token is also not present then we will set user to null
            try {
                const newAccessToken = await refreshAccessToken();
                if(newAccessToken.success){
                    const response = await getUser();
                    if(response.success){
                        setUser(response.data);
                    }else{
                        setUser(null);
                    }
                }else{
                    setUser(null);
                }

            } catch (error) {
                console.log("Refresh failed:", error);
                setUser(null);
            }
        }finally{
            setLoading(false);
        }
    }

    const Login = async(credentials)=>{
        const response = await LoginUser(credentials);
        if(response.success){
            setUser(response.data);
        }
        return response;
    }

    const Register = async(credentials)=>{
        const response = await RegisterUser(credentials);
        if(response.success){
            setUser(response.data);
        }
        return response;
    }

    const LogoutDevice = async()=>{
        const response = await logoutDevice();
        if(response.success){
            setUser(null);
        }
        return response;
    }

    const LogoutAll = async()=>{
        const response = await logoutAll();
        if(response.success){
            setUser(null);
        }
        return response;
    }

    useEffect(() => {
      const init = async()=>{
         await checkSession(); 
      }
      init();
    }, [])
    
    return (
        <AuthContext.Provider 
            value={{user,setUser,loading,Login,Register,LogoutDevice,LogoutAll}}
        >
            {children}
        </AuthContext.Provider>
    )
}