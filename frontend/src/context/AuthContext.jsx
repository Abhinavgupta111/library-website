import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';

const AuthContext = createContext();

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
    const { getToken, isSignedIn, isLoaded: clerkLoaded } = useClerkAuth();
    const { user: clerkUser } = useUser();

    // Library-specific profile from MongoDB
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Call our backend to sync Clerk user with MongoDB.
     * Optionally pass profile fields (branch, year, roll_number).
     */
    const syncWithBackend = useCallback(async (extraFields = {}) => {
        try {
            const token = await getToken();
            if (!token) return null;

            const { data } = await axios.post(
                `${API}/api/auth/sync`,
                extraFields,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUserInfo(data);
            return data;
        } catch (err) {
            console.error('[AuthContext] Backend sync failed:', err.response?.data || err.message);
            return null;
        }
    }, [getToken]);

    // Sync whenever Clerk auth state changes
    useEffect(() => {
        if (!clerkLoaded) return;

        if (!isSignedIn) {
            setUserInfo(null);
            setIsLoading(false);
            return;
        }

        // Signed in — sync with backend
        setIsLoading(true);
        syncWithBackend().finally(() => setIsLoading(false));
    }, [isSignedIn, clerkLoaded, syncWithBackend]);

    // Axios interceptor: attach Clerk token to every request automatically
    useEffect(() => {
        const reqInterceptor = axios.interceptors.request.use(async (config) => {
            if (isSignedIn) {
                try {
                    const token = await getToken();
                    if (token) config.headers.Authorization = `Bearer ${token}`;
                } catch {/* ignore */}
            }
            return config;
        });
        return () => axios.interceptors.request.eject(reqInterceptor);
    }, [isSignedIn, getToken]);

    return (
        <AuthContext.Provider value={{
            userInfo,
            isLoading,
            clerkUser,
            syncWithBackend,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
