import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Mosaic } from 'react-loading-indicators';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({children}) => {
    const {loading,user} = useAuth();
    if(loading){
        return <Mosaic color={["#29c029", "#2974c0", "#c029c0", "#c07429"]} />
    }
    if(user){
        return <Navigate to='/dashboard' replace></Navigate>
    }
    return children
}

export default PublicRoute
