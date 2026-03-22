import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const svgProps = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
};

const IconDashboard = () => (
    <svg {...svgProps}>
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
);

const IconBook = () => (
    <svg {...svgProps}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
);

const IconChat = () => (
    <svg {...svgProps}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

const IconCalendar = () => (
    <svg {...svgProps}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const IconSettings = () => (
    <svg {...svgProps}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
);

const BrandMark = () => (
    <svg className="brand-mark" viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true">
        <rect x="4" y="6" width="22" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
        <path d="M9 6v20M16 6v20M9 13h14M9 19h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="24" cy="10" r="3" fill="currentColor" opacity="0.9" />
    </svg>
);

const Sidebar = ({ className = '', onNavigate }) => {
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || { name: 'Sarah Jenkins', role: 'Student' };

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        onNavigate?.();
        navigate('/login');
    };

    const handleNav = () => {
        onNavigate?.();
    };

    return (
        <aside id="app-sidebar" className={`sidebar ${className}`.trim()}>
            <div className="sidebar-brand">
                <BrandMark />
                <div className="brand-copy">
                    <div className="brand-text">Mait IT Library</div>
                    <div className="brand-tagline">Central Library Portal</div>
                </div>
            </div>

            <div className="sidebar-nav">
                <div className="nav-section">
                    <div className="nav-label">Main Menu</div>
                    <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end onClick={handleNav}>
                        <span className="nav-icon-wrap"><IconDashboard /></span>
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/books" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={handleNav}>
                        <span className="nav-icon-wrap"><IconBook /></span>
                        <span>Library</span>
                    </NavLink>
                    <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={handleNav}>
                        <span className="nav-icon-wrap"><IconChat /></span>
                        <span>Chat & Groups</span>
                    </NavLink>
                    <NavLink to="/events" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={handleNav}>
                        <span className="nav-icon-wrap"><IconCalendar /></span>
                        <span>Events</span>
                    </NavLink>
                </div>

                {userInfo?.role === 'admin' && (
                    <div className="nav-section">
                        <div className="nav-label">Administration</div>
                        <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={handleNav}>
                            <span className="nav-icon-wrap"><IconSettings /></span>
                            <span>Admin Dashboard</span>
                        </NavLink>
                    </div>
                )}
            </div>

            <div className="sidebar-profile">
                <div className="profile-info">
                    <div className="profile-avatar" aria-hidden="true">
                        {userInfo.name.charAt(0)}
                    </div>
                    <div className="profile-text">
                        <div className="profile-name">{userInfo.name}</div>
                        <div className="profile-role">{userInfo.role}</div>
                    </div>
                </div>
                <button className="logout-btn" type="button" onClick={logoutHandler} title="Logout" aria-label="Log out">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
