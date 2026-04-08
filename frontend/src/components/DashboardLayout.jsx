import React from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import { useTheme } from '../context/ThemeContext';
import './DashboardLayout.css';

const DashboardLayout = ({ children, noPadding = false }) => {
    const { isSidebarCollapsed } = useTheme();

    return (
        <div className={`dashboard-layout ${isSidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
            <Sidebar />
            <div className="dashboard-main-wrapper">
                <TopHeader />
                <main className={`dashboard-content ${noPadding ? 'no-padding' : ''}`}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
