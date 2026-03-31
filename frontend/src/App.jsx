import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Home from './pages/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Library from './pages/Library';
import Events from './pages/Events';
import Chat from './pages/Chat';
import Admin from './pages/Admin';
import { AuthProvider } from './context/AuthContext';
import './index.css';

const AppRoutes = () => {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

    if (isAuthPage) {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
            </Routes>
        );
    }

    const isChatPage = location.pathname === '/chat';
    const isHomePage = location.pathname === '/';

    return (
        <DashboardLayout noPadding={isChatPage || isHomePage}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/library" element={<Library />} />
                <Route path="/events" element={<Events />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/admin" element={<Admin />} />
            </Routes>
        </DashboardLayout>
    );
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
