import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved ? saved === 'dark' : true;
    });

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved === 'true';
    });

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);
        if (isSidebarCollapsed) {
            document.documentElement.style.setProperty('--sidebar-width', '72px');
        } else {
            document.documentElement.style.setProperty('--sidebar-width', '260px');
        }
    }, [isSidebarCollapsed]);

    const toggleTheme = () => setIsDarkMode(prev => !prev);
    const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, isSidebarCollapsed, toggleSidebar }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
