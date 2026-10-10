import './App.css'
import { Routes,Route } from 'react-router-dom'
import RegLogin from './pages/RegLogin.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Transactions from './pages/Transactions.jsx'
import Profile from './pages/Profile.jsx'
import Payments from './pages/Payments.jsx'
import Statistics from './pages/Statistics.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import PublicRoute from './components/common/PublicRoute.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import { ToastContainer } from 'react-toastify';
import {useAuth} from './hooks/useAuth.jsx'
function App() {
  const { user } = useAuth();

  return (
    <>
      <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
        />
      <Routes>
        <Route path='/' element={<PublicRoute><RegLogin/></PublicRoute>}></Route>
        <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />}/>
                <Route path="/transactions" element={<Transactions />}/>
                <Route path="/payments" element={<Payments />}/>
                <Route path="/statistics" element={<Statistics />}/>
                <Route path="/profile" element={<Profile user={user}/>}/>
            </Route>
        </Route>
      </Routes>
    </>
  )
}

export default App
