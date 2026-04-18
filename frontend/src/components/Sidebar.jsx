import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const { isSidebarCollapsed } = useTheme();
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || { name: 'Sarah Jenkins', role: 'Student' };

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    return (
        <aside className={`sidebar ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <div className="sidebar-brand">
                <div className="brand-logo">📚</div>
                {!isSidebarCollapsed && <div className="brand-text">MAIT Library</div>}
            </div>

            <div className="sidebar-nav">
                <div className="nav-section">
                    {!isSidebarCollapsed && <div className="nav-label">Main Menu</div>}
                    <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end title="Dashboard">
                        <i className="nav-icon">📊</i>
                        {!isSidebarCollapsed && <span>Dashboard</span>}
                    </NavLink>
                    <NavLink to="/books" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Library">
                        <i className="nav-icon">📖</i>
                        {!isSidebarCollapsed && <span>Library</span>}
                    </NavLink>
                    <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Chat & Groups">
                        <i className="nav-icon">💬</i>
                        {!isSidebarCollapsed && <span>Chat & Groups</span>}
                    </NavLink>
                    <NavLink to="/events" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Events">
                        <i className="nav-icon">📅</i>
                        {!isSidebarCollapsed && <span>Events</span>}
                    </NavLink>
                </div>

                {(userInfo?.role === 'Admin' || userInfo?.role === 'Librarian') && (
                    <div className="nav-section">
                        {!isSidebarCollapsed && <div className="nav-label">Administration</div>}
                        <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Admin Dashboard">
                            <i className="nav-icon">⚙️</i>
                            {!isSidebarCollapsed && <span>Admin Dashboard</span>}
                        </NavLink>
                    </div>
                )}
            </div>

            <div className="sidebar-profile">
                <div className="profile-info">
                    <div className="profile-avatar">
                        {userInfo.name.charAt(0)}
                    </div>
                    {!isSidebarCollapsed && (
                        <div className="profile-text">
                            <div className="profile-name">{userInfo.name}</div>
                            <div className="profile-role">{userInfo.role}</div>
                        </div>
                    )}
                </div>
                {!isSidebarCollapsed && (
                    <button className="logout-btn" onClick={logoutHandler} title="Logout">
                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                    </button>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
