import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, useAuth as useClerkAuth } from '@clerk/clerk-react';
import DashboardLayout from './components/DashboardLayout';
import Home from './pages/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import CompleteProfile from './pages/CompleteProfile';
import Library from './pages/Library';
import Events from './pages/Events';
import Chat from './pages/Chat';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

// Loading spinner used while Clerk or backend syncs
const LoadingScreen = () => (
    <div style={{
        width: '100%', minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#0f172a', color: '#94a3b8',
        flexDirection: 'column', gap: '1rem'
    }}>
        <div style={{
            width: 44, height: 44,
            border: '3px solid #1e293b',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: '0.9rem' }}>Loading…</span>
    </div>
);

const AppRoutes = () => {
    const { isLoaded: clerkLoaded, isSignedIn } = useClerkAuth();
    const { userInfo, isLoading } = useAuth();
    const location = useLocation();

    // Wait for Clerk to initialize
    if (!clerkLoaded) return <LoadingScreen />;

    const isAuthPage = ['/login', '/signup'].includes(location.pathname);
    const isProfilePage = location.pathname === '/complete-profile';

    // Auth pages — redirect away if already signed in
    if (isAuthPage) {
        if (isSignedIn) return <Navigate to="/" replace />;
        return (
            <Routes>
                <Route path="/login"  element={<Login />} />
                <Route path="/signup" element={<Signup />} />
            </Routes>
        );
    }

    // Not signed in — redirect to login
    if (!isSignedIn) {
        return <RedirectToSignIn redirectUrl={location.pathname} />;
    }

    // Complete profile page — available immediately after sign-up
    if (isProfilePage) {
        return (
            <Routes>
                <Route path="/complete-profile" element={<CompleteProfile />} />
            </Routes>
        );
    }

    // Wait for backend sync
    if (isLoading) return <LoadingScreen />;

    // Profile not finished — force to complete-profile
    if (isSignedIn && userInfo && !userInfo.profileComplete) {
        return <Navigate to="/complete-profile" replace />;
    }

    // No backend profile yet (first load edge case) — force to complete-profile
    if (isSignedIn && !userInfo) {
        return <Navigate to="/complete-profile" replace />;
    }

    const isChatPage = location.pathname === '/chat';

    return (
        <DashboardLayout noPadding={isChatPage}>
            <Routes>
                <Route path="/"        element={<Home />} />
                <Route path="/books"   element={<Library />} />
                <Route path="/events"  element={<Events />} />
                <Route path="/chat"    element={<Chat />} />
                <Route path="/admin"   element={<Admin />} />
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
