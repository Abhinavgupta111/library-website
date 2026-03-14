import React from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-main-wrapper">
                <TopHeader />
                <main className="dashboard-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
