import { AccountProvider } from "./AccountProvider.jsx";
import {AuthProvider} from "./AuthProvider.jsx";
import {NotificationProvider} from "./NotificationProvider.jsx";

const AppProviders = ({ children }) => {
    return (
        <AuthProvider>
            <NotificationProvider>
                <AccountProvider>
                    {children}
                </AccountProvider>
            </NotificationProvider>
        </AuthProvider>
    );
};

export default AppProviders;