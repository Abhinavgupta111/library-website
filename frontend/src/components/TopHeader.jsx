import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './TopHeader.css';

const TopHeader = ({ onMenuClick, menuOpen = false }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved ? saved === 'dark' : true;
    });
    const [showHelp, setShowHelp] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const helpRef = useRef(null);
    const notifRef = useRef(null);

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (helpRef.current && !helpRef.current.contains(e.target)) setShowHelp(false);
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [notifications, setNotifications] = useState([]);

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

    const helpItems = [
        { icon: '📖', label: 'How to borrow a book' },
        { icon: '💬', label: 'Using campus chat groups' },
        { icon: '📅', label: 'Viewing upcoming events' },
        { icon: '⚙️', label: 'Account & settings' },
    ];

    return (
        <header className="top-header">
            {onMenuClick && (
                <button
                    type="button"
                    className="mobile-nav-toggle icon-btn"
                    onClick={onMenuClick}
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={menuOpen}
                    aria-controls="app-sidebar"
                >
                    <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        {menuOpen ? (
                            <>
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </>
                        ) : (
                            <>
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </>
                        )}
                    </svg>
                </button>
            )}

            <div className="header-search">
                <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                    type="search"
                    placeholder="Search books, events…"
                    className="search-input"
                    aria-label="Search books and events"
                />
            </div>

            <div className="header-actions">
                <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    title={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                    aria-pressed={isDarkMode}
                >
                    {isDarkMode ? (
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                            <line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                    )}
                </button>

                <div className="header-dropdown-wrap" ref={helpRef}>
                    <button
                        type="button"
                        className="icon-btn"
                        onClick={() => { setShowHelp(v => !v); setShowNotifications(false); }}
                        aria-expanded={showHelp}
                        aria-haspopup="true"
                        title="Help"
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </button>
                    {showHelp && (
                        <div className="header-dropdown" role="menu">
                            <div className="header-dropdown-title">Quick help</div>
                            {helpItems.map((item, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className="header-dropdown-item"
                                    role="menuitem"
                                    onClick={() => setShowHelp(false)}
                                >
                                    <span className="header-dropdown-icon" aria-hidden="true">{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="header-dropdown-wrap" ref={notifRef}>
                    <button
                        type="button"
                        className="icon-btn notification-btn"
                        onClick={() => { setShowNotifications(v => !v); setShowHelp(false); }}
                        aria-expanded={showNotifications}
                        aria-haspopup="true"
                        title="Notifications"
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        {notifications.length > 0 && <span className="notification-dot" aria-hidden="true"></span>}
                    </button>
                    {showNotifications && (
                        <div className="header-dropdown header-dropdown--wide" role="menu">
                            <div className="header-dropdown-title header-dropdown-title--row">
                                <span>Notifications</span>
                                <button type="button" className="header-dropdown-link" onClick={() => setShowNotifications(false)}>
                                    Mark all read
                                </button>
                            </div>
                            {notifications.length > 0 ? notifications.map((n, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className="header-dropdown-item header-dropdown-item--stack"
                                    role="menuitem"
                                    onClick={() => setShowNotifications(false)}
                                >
                                    <span className="header-dropdown-icon header-dropdown-icon--lg" aria-hidden="true">{n.icon}</span>
                                    <span className="header-dropdown-text">
                                        <span className="header-dropdown-line">{n.text}</span>
                                        <span className="header-dropdown-meta">{n.time}</span>
                                    </span>
                                </button>
                            )) : (
                                <div className="header-dropdown-empty">No notifications yet.</div>
                            )}
                            <button type="button" className="header-dropdown-footer" onClick={() => setShowNotifications(false)}>
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopHeader;
