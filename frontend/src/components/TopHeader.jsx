import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import './TopHeader.css';

const TopHeader = () => {
    const { isDarkMode, toggleTheme, isSidebarCollapsed, toggleSidebar } = useTheme();
    const [showHelp, setShowHelp] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const helpRef = useRef(null);
    const notifRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (helpRef.current && !helpRef.current.contains(e.target)) setShowHelp(false);
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        axios.get('http://localhost:5000/api/events')
            .then(res => {
                const mapped = res.data.slice(0, 3).map(e => ({
                    icon: '📅',
                    text: `${e.title} — ${e.venue}`,
                    time: `Date: ${new Date(e.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                }));
                setNotifications(mapped);
            })
            .catch(() => setNotifications([]));
    }, []);

    return (
        <header className="top-header">
            {/* Sidebar Toggle Button */}
            <button
                className="sidebar-toggle-btn"
                onClick={toggleSidebar}
                title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                aria-label="Toggle sidebar"
            >
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    {isSidebarCollapsed ? (
                        <>
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </>
                    ) : (
                        <>
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="15" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </>
                    )}
                </svg>
            </button>

            <div className="header-search">
                <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input type="text" placeholder="Search books, events, or users..." className="search-input" />
            </div>

            <div className="header-actions">
                {/* Dark/Light Mode Toggle */}
                <button
                    className={`icon-btn theme-toggle-btn ${isDarkMode ? 'dark-active' : 'light-active'}`}
                    onClick={toggleTheme}
                    title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    aria-label="Toggle theme"
                >
                    {isDarkMode ? (
                        /* Sun icon for dark mode (click to go light) */
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="1" x2="12" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="23"></line>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                            <line x1="1" y1="12" x2="3" y2="12"></line>
                            <line x1="21" y1="12" x2="23" y2="12"></line>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                    ) : (
                        /* Moon icon for light mode (click to go dark) */
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                    )}
                </button>

                {/* Help Button */}
                <div className="dropdown-wrapper" ref={helpRef}>
                    <button className="icon-btn" onClick={() => { setShowHelp(v => !v); setShowNotifications(false); }} title="Help">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </button>
                    {showHelp && (
                        <div className="dropdown-panel">
                            <div className="dropdown-header">Quick Help</div>
                            {[
                                { icon: '📖', label: 'How to borrow a book' },
                                { icon: '💬', label: 'Using campus chat groups' },
                                { icon: '📅', label: 'Viewing upcoming events' },
                                { icon: '⚙️', label: 'Account & settings' },
                            ].map((item, i) => (
                                <div key={i} className="dropdown-item" onClick={() => setShowHelp(false)}>
                                    <span>{item.icon}</span> {item.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Notification Button */}
                <div className="dropdown-wrapper" ref={notifRef}>
                    <button className="icon-btn notification-btn" onClick={() => { setShowNotifications(v => !v); setShowHelp(false); }} title="Notifications">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        {notifications.length > 0 && <span className="notification-dot"></span>}
                    </button>
                    {showNotifications && (
                        <div className="dropdown-panel notif-panel">
                            <div className="dropdown-header notif-header">
                                <span>Notifications</span>
                                <span className="notif-mark-read" onClick={() => setShowNotifications(false)}>Mark all read</span>
                            </div>
                            {notifications.length > 0 ? notifications.map((n, i) => (
                                <div key={i} className="dropdown-item notif-item">
                                    <span className="notif-icon">{n.icon}</span>
                                    <div>
                                        <div className="notif-text">{n.text}</div>
                                        <div className="notif-time">{n.time}</div>
                                    </div>
                                </div>
                            )) : (
                                <div className="notif-empty">No notifications yet.</div>
                            )}
                            <div className="notif-footer" onClick={() => setShowNotifications(false)}>
                                View all notifications
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopHeader;
