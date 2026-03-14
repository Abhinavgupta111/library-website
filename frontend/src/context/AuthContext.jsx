import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            setUserInfo(JSON.parse(storedUser));
        }
    }, []);

    const login = (userData) => {
        try {
            localStorage.setItem('userInfo', JSON.stringify(userData));
            setUserInfo(userData);
            console.log("AuthContext: Login successful, user stored", userData.email);
        } catch (error) {
            console.error("AuthContext: Failed to store user info during login:", error);
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUserInfo(null);
    };

    return (
        <AuthContext.Provider value={{ userInfo, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
