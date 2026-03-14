import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || { name: 'Sarah Jenkins', role: 'Student' };

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-logo">📚</div>
                <div className="brand-text">Smart Campus</div>
            </div>

            <div className="sidebar-nav">
                <div className="nav-section">
                    <div className="nav-label">Main Menu</div>
                    <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
                        <i className="nav-icon">📊</i> Dashboard
                    </NavLink>
                    <NavLink to="/books" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <i className="nav-icon">📖</i> Library
                    </NavLink>
                    <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <i className="nav-icon">💬</i> Chat & Groups
                    </NavLink>
                    <NavLink to="/events" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <i className="nav-icon">📅</i> Events
                    </NavLink>
                </div>

                {userInfo?.role === 'admin' && (
                    <div className="nav-section">
                        <div className="nav-label">Administration</div>
                        <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <i className="nav-icon">⚙️</i> Admin Dashboard
                        </NavLink>
                    </div>
                )}
            </div>

            <div className="sidebar-profile">
                <div className="profile-info">
                    <div className="profile-avatar">
                        {userInfo.name.charAt(0)}
                    </div>
                    <div className="profile-text">
                        <div className="profile-name">{userInfo.name}</div>
                        <div className="profile-role">{userInfo.role}</div>
                    </div>
                </div>
                <button className="logout-btn" onClick={logoutHandler} title="Logout">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
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
