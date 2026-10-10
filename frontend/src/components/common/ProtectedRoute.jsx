import React from 'react'
import { useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Mosaic } from 'react-loading-indicators';
import { Navigate,Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';
import { toastConfig } from '../../utils/toastConfig';

const ProtectedRoute = () => {
    const {loading,user} = useAuth();
    console.log("protectedRoute",loading,user)
    useEffect(()=>{
        if(!loading && !user){
            toast.error("You need to login first",toastConfig);
        }
    },[loading,user])
    
    if(loading){
        return <Mosaic color={["#29c029", "#2974c0", "#c029c0", "#c07429"]} />
    }

    if(!user){
        return <Navigate to='/' replace></Navigate>
    }
    return <Outlet />
}

export default ProtectedRoute
