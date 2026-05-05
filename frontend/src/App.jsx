import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Home from './pages/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Library from './pages/Library';
import Events from './pages/Events';
import Chat from './pages/Chat';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

const AppRoutes = () => {
    const { userInfo } = useAuth();
    const location = useLocation();
    const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(location.pathname)
        || location.pathname.startsWith('/reset-password');

    if (isAuthPage) {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Routes>
        );
    }

    // Redirect unauthenticated users to login
    if (!userInfo) {
        return <Navigate to="/login" replace />;
    }

    const isChatPage = location.pathname === '/chat';

    return (
        <DashboardLayout noPadding={isChatPage}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/books" element={<Library />} />
                <Route path="/events" element={<Events />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </DashboardLayout>
    );
};

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
