import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

const DashboardLayout = ({ children, noPadding = false }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-gray-50 text-[var(--text-main)] font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-30 bg-gray-900/50 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onCloseMobile={() => setIsSidebarOpen(false)} />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative z-10 transition-all duration-300">
                <TopHeader 
                    onMenuClick={toggleSidebar} 
                    isSidebarOpen={isSidebarOpen} 
                />
                
                <main className={`flex-1 overflow-x-hidden overflow-y-auto no-scrollbar scroll-smooth ${noPadding ? '' : 'p-6 md:p-8'}`}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
