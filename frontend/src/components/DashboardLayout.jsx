import React from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import './DashboardLayout.css';

const DashboardLayout = ({ children, noPadding = false }) => {
    return (
        <div className="dashboard-layout">
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
