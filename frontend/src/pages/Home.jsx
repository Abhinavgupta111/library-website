import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const { userInfo } = useAuth();
    const [borrowedCount, setBorrowedCount] = useState(0);

    useEffect(() => {
        if (userInfo?.token) {
            axios.get('http://localhost:5000/api/books/my-borrowed', {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            }).then(res => setBorrowedCount(res.data.length)).catch(() => {});
        }
    }, [userInfo]);

    return (
        <div className="home-dashboard">
            {/* Hero Section */}
            <div className="hero-banner">
                <div className="hero-content">
                    <h1>Welcome back, {userInfo?.name || 'Student'} 👋</h1>
                    <p>You have <strong>3 books</strong> due this week. Stay on top of your reading!</p>
                </div>
                <div className="hero-actions">
                    <button className="btn btn-secondary" onClick={() => navigate('/books')}>Browse Library</button>
                    <button className="btn btn-outline-white" onClick={() => navigate('/chat')}>Open Chat</button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card" onClick={() => navigate('/books')}>
                    <div className="kpi-icon-wrapper bg-primary-light text-primary">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                        </svg>
                    </div>
                    <div className="kpi-details">
                        <span className="kpi-value">{borrowedCount}</span>
                        <span className="kpi-label">Books Borrowed</span>
                    </div>
                </div>
                <div className="kpi-card" onClick={() => navigate('/chat')}>
                    <div className="kpi-icon-wrapper bg-accent-light" style={{ color: 'var(--accent)' }}>
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </div>
                    <div className="kpi-details">
                        <span className="kpi-value">12</span>
                        <span className="kpi-label">Unread Messages</span>
                    </div>
                </div>
                <div className="kpi-card" onClick={() => navigate('/events')}>
                    <div className="kpi-icon-wrapper bg-warning-light text-warning">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </div>
                    <div className="kpi-details">
                        <span className="kpi-value">2</span>
                        <span className="kpi-label">Upcoming Events</span>
                    </div>
                </div>
                <div className="kpi-card" onClick={() => navigate('/')}>
                    <div className="kpi-icon-wrapper bg-success-light text-success">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                            <line x1="12" y1="18" x2="12" y2="22"></line>
                            <line x1="12" y1="2" x2="12" y2="6"></line>
                        </svg>
                    </div>
                    <div className="kpi-details">
                        <span className="kpi-value">$0.00</span>
                        <span className="kpi-label">Library Fines</span>
                    </div>
                </div>
            </div>

            {/* Bottom Content Grid */}
            <div className="content-grid">
                {/* Left Column: Library Highlights */}
                <div className="grid-main">
                    <div className="section-header">
                        <h2>Library Highlights</h2>
                        <button className="btn btn-sm btn-outline" onClick={() => navigate('/books')}>View All Books</button>
                    </div>
                    <div className="books-grid">
                        {/* Dummy Book 1 */}
                        <div className="book-card" onClick={() => navigate('/books')}>
                            <div className="book-cover placeholder-cover-1"></div>
                            <div className="book-info">
                                <h4>The Design of Everyday ...</h4>
                                <p>Don Norman</p>
                                <span className="pill pill-success">Available</span>
                            </div>
                        </div>
                        {/* Dummy Book 2 */}
                        <div className="book-card" onClick={() => navigate('/books')}>
                            <div className="book-cover placeholder-cover-2"></div>
                            <div className="book-info">
                                <h4>Clean Code</h4>
                                <p>Robert C. Martin</p>
                                <span className="pill pill-warning">Waitlist (2)</span>
                            </div>
                        </div>
                        {/* Dummy Book 3 */}
                        <div className="book-card" onClick={() => navigate('/books')}>
                            <div className="book-cover placeholder-cover-3"></div>
                            <div className="book-info">
                                <h4>Atomic Habits</h4>
                                <p>James Clear</p>
                                <span className="pill pill-success">Available</span>
                            </div>
                        </div>
                        {/* Dummy Book 4 */}
                        <div className="book-card" onClick={() => navigate('/books')}>
                            <div className="book-cover placeholder-cover-4"></div>
                            <div className="book-info">
                                <h4>Database Internals</h4>
                                <p>Alex Petrov</p>
                                <span className="pill pill-warning">Waitlist (1)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Activity Sidebar */}
                <div className="grid-sidebar">
                    {/* Events Panel */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <h3>Upcoming Events</h3>
                        </div>
                        <div className="panel-body list-wrapper">
                            <div className="list-item" onClick={() => navigate('/events')}>
                                <div className="date-badge">
                                    <span className="month">Mar</span>
                                    <span className="day">24</span>
                                </div>
                                <div className="item-details">
                                    <h4>India Convergence Expo</h4>
                                    <p>Bharat Mandapam, New Delhi</p>
                                </div>
                            </div>
                            <div className="list-item" onClick={() => navigate('/events')}>
                                <div className="date-badge">
                                    <span className="month">Mar</span>
                                    <span className="day">25</span>
                                </div>
                                <div className="item-details">
                                    <h4>Poster Submission Deadline</h4>
                                    <p>Online – IT Department</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat Panel */}
                    <div className="dashboard-panel mt-4">
                        <div className="panel-header">
                            <h3>Recent Chats</h3>
                        </div>
                        <div className="panel-body list-wrapper">
                            <div className="list-item align-center" onClick={() => navigate('/chat')}>
                                <div className="avatar-circle">MC</div>
                                <div className="item-details">
                                    <h4>Math Club</h4>
                                    <p>Are we meeting tomorrow?</p>
                                </div>
                                <span className="notification-badge">2</span>
                            </div>
                            <div className="list-item align-center" onClick={() => navigate('/chat')}>
                                <div className="avatar-circle">JP</div>
                                <div className="item-details">
                                    <h4>John Peterson</h4>
                                    <p>Thanks for the notes!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
