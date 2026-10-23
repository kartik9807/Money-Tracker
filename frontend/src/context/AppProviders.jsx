import {AuthProvider} from "./AuthProvider.jsx";
import {NotificationProvider} from "./NotificationProvider.jsx";
import { AccountProvider } from "./AccountProvider.jsx";
import { TransactionProvider } from "./TransactionProvider.jsx";

const AppProviders = ({ children }) => {
    return (
        <AuthProvider>
            <NotificationProvider>
                <AccountProvider>
                    <TransactionProvider>
                        {children}
                    </TransactionProvider>
                </AccountProvider>
            </NotificationProvider>
        </AuthProvider>
    );
};

export default AppProviders;