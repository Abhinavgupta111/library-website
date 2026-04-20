import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

/**
 * Decode a JWT without verifying the signature (client-side expiry check only).
 * Real verification is always done server-side.
 */
function decodeJwt(token) {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
        return null;
    }
}

function isTokenExpired(token) {
    if (!token) return true;
    const decoded = decodeJwt(token);
    if (!decoded || !decoded.exp) return true;
    // Give a 30-second buffer so we log out slightly before expiry
    return decoded.exp * 1000 < Date.now() + 30_000;
}

export const AuthProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);

    // ── Secure logout ─────────────────────────────────────────────────────────
    const logout = useCallback(() => {
        localStorage.removeItem('userInfo');
        setUserInfo(null);
    }, []);

    // ── On mount: restore session, validate token expiry ─────────────────────
    useEffect(() => {
        try {
            const stored = localStorage.getItem('userInfo');
            if (!stored) return;

            const parsed = JSON.parse(stored);

            // Basic structural sanity check
            if (!parsed || !parsed.token || !parsed._id || !parsed.email) {
                localStorage.removeItem('userInfo');
                return;
            }

            // Reject expired tokens immediately
            if (isTokenExpired(parsed.token)) {
                console.warn('[AuthContext] Token expired — clearing session.');
                localStorage.removeItem('userInfo');
                return;
            }

            setUserInfo(parsed);
        } catch {
            localStorage.removeItem('userInfo');
        }
    }, []);

    // ── Axios interceptor: auto-logout on 401 / 423 from any API call ─────────
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (res) => res,
            (err) => {
                const status = err?.response?.status;
                if (status === 401 || status === 423) {
                    console.warn(`[AuthContext] Received ${status} — forcing logout.`);
                    logout();
                    // Redirect without React Router (context may not have navigate)
                    if (!window.location.pathname.startsWith('/login') &&
                        !window.location.pathname.startsWith('/register')) {
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(err);
            }
        );
        return () => axios.interceptors.response.eject(interceptor);
    }, [logout]);

    // ── Periodic expiry check (every 60 s) ───────────────────────────────────
    useEffect(() => {
        if (!userInfo?.token) return;
        const timer = setInterval(() => {
            if (isTokenExpired(userInfo.token)) {
                console.warn('[AuthContext] Token expired (periodic check) — logging out.');
                logout();
            }
        }, 60_000);
        return () => clearInterval(timer);
    }, [userInfo, logout]);

    // ── Login: store only the minimal user object ─────────────────────────────
    const login = (userData) => {
        try {
            // Only keep necessary fields — never store passwords or sensitive extras
            const safe = {
                _id:         userData._id,
                name:        userData.name,
                email:       userData.email,
                role:        userData.role,
                branch:      userData.branch,
                year:        userData.year,
                roll_number: userData.roll_number,
                token:       userData.token,
            };
            localStorage.setItem('userInfo', JSON.stringify(safe));
            setUserInfo(safe);
        } catch (error) {
            console.error('[AuthContext] Failed to store user info:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ userInfo, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
