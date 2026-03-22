import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import DashboardFooter from './DashboardFooter';
import './DashboardLayout.css';

const DashboardLayout = ({ children, noPadding = false }) => {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {
        document.body.classList.toggle('nav-open', mobileNavOpen);
        return () => document.body.classList.remove('nav-open');
    }, [mobileNavOpen]);

    const closeMobileNav = () => setMobileNavOpen(false);

    return (
        <div className="dashboard-layout">
            <button
                type="button"
                className={`sidebar-backdrop${mobileNavOpen ? ' is-visible' : ''}`}
                aria-label="Close navigation menu"
                onClick={closeMobileNav}
            />
            <Sidebar
                className={mobileNavOpen ? 'sidebar--open' : ''}
                onNavigate={closeMobileNav}
            />
            <div className="dashboard-main-wrapper">
                <TopHeader
                    onMenuClick={() => setMobileNavOpen((v) => !v)}
                    menuOpen={mobileNavOpen}
                />
                <main id="top" className={`dashboard-content ${noPadding ? 'no-padding' : ''}`}>
                    {children}
                </main>
                {!noPadding && <DashboardFooter />}
            </div>
        </div>
    );
};

export default DashboardLayout;
