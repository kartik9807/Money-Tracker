import {  Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar.jsx";
import Topbar from "../components/layout/Topbar.jsx";
import { toast } from "react-toastify";
import { toastConfig } from "../utils/toastConfig.jsx";
import {useAuth} from "../hooks/useAuth.jsx";
import {useNavigate} from "react-router-dom";

const AppLayout = () => {
    const navigate = useNavigate();
    const {LogoutDevice,LogoutAll} = useAuth();
    const onLogoutThisDevice = async ()=>{
        try {
            const response = await LogoutDevice();
            if(response.success){
                console.log("Logged out from this device successfully");
                toast.success("Logged out from this device successfully",toastConfig);
                navigate("/",{replace:true});
            }
        } catch (error) {
            console.log("Error in logging out from this device ",error);
            toast.error("Error in logging out from this device",toastConfig);
        }
    }

    const onLogoutAllDevices = async ()=>{
        try {
            const response = await LogoutAll();
            if(response.success){
                console.log("Logged out from all devices successfully");
                toast.success("Logged out from all devices successfully",toastConfig);
                navigate("/",{replace:true});
            }
        } catch (error) {
            console.log("Error in logging out from all devices ",error);
            toast.error("Error in logging out from all devices",toastConfig);
        }
    }

    const onNotificationsClick = ()=>{

    }


    const {user} = useAuth();
    return (
        <>
        
        <div className="min-h-screen bg-[#f7f8fc]">
            <div className="flex min-h-screen">
                <Sidebar onLogoutThisDevice={onLogoutThisDevice} onLogoutAllDevices={onLogoutAllDevices} />
                <div className="flex-1">
                    <Topbar user={user} onNotificationsClick={onNotificationsClick} />
                    <main className="p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
        </>
    );
};

export default AppLayout;