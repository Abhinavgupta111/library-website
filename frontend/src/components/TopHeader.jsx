import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './TopHeader.css';

const TopHeader = () => {
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

    const dropdownStyle = {
        position: 'absolute', top: 'calc(100% + 10px)', right: 0,
        background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
        zIndex: 200, minWidth: '220px', overflow: 'hidden',
    };

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

    return (
        <header className="top-header">
            <div className="header-search">
                <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" stroke="var(--text-muted)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input type="text" placeholder="Search books, events, or users..." className="search-input" />
            </div>

            <div className="header-actions">
                {/* Dark Mode Toggle */}
                <button className="icon-btn" onClick={() => setIsDarkMode(!isDarkMode)} title="Toggle Dark Mode">
                    {isDarkMode ? (
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                            <line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                    )}
                </button>

                {/* Help Button */}
                <div style={{ position: 'relative' }} ref={helpRef}>
                    <button className="icon-btn" onClick={() => { setShowHelp(v => !v); setShowNotifications(false); }} title="Help">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </button>
                    {showHelp && (
                        <div style={dropdownStyle}>
                            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}>
                                Quick Help
                            </div>
                            {[
                                { icon: '📖', label: 'How to borrow a book' },
                                { icon: '💬', label: 'Using campus chat groups' },
                                { icon: '📅', label: 'Viewing upcoming events' },
                                { icon: '⚙️', label: 'Account & settings' },
                            ].map((item, i) => (
                                <div key={i} onClick={() => setShowHelp(false)}
                                    style={{ padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', color: '#cbd5e1', fontSize: '0.88rem' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <span>{item.icon}</span> {item.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Notification Button */}
                <div style={{ position: 'relative' }} ref={notifRef}>
                    <button className="icon-btn notification-btn" onClick={() => { setShowNotifications(v => !v); setShowHelp(false); }} title="Notifications">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        {notifications.length > 0 && <span className="notification-dot"></span>}
                    </button>
                    {showNotifications && (
                        <div style={{ ...dropdownStyle, minWidth: '280px' }}>
                            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                Notifications
                                <span style={{ fontSize: '0.75rem', color: '#6366f1', cursor: 'pointer' }} onClick={() => setShowNotifications(false)}>Mark all read</span>
                            </div>
                            {notifications.length > 0 ? notifications.map((n, i) => (
                                <div key={i} style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <span style={{ fontSize: '1.2rem' }}>{n.icon}</span>
                                    <div>
                                        <div style={{ color: '#e2e8f0', fontSize: '0.85rem', lineHeight: 1.4 }}>{n.text}</div>
                                        <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.2rem' }}>{n.time}</div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                                    No notifications yet.
                                </div>
                            )}
                            <div style={{ padding: '0.65rem 1rem', textAlign: 'center', color: '#6366f1', fontSize: '0.85rem', cursor: 'pointer' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                onClick={() => setShowNotifications(false)}>
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
