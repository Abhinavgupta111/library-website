import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const ENDPOINT = 'http://localhost:5000';

const Home = () => {
    const navigate = useNavigate();
    const { userInfo } = useAuth();
    const [borrowedCount, setBorrowedCount] = useState(0);
    const [totalBooks, setTotalBooks] = useState(0);
    const [eventCount, setEventCount] = useState(0);
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);

    useEffect(() => {
        const config = userInfo?.token
            ? { headers: { Authorization: `Bearer ${userInfo.token}` } }
            : {};

        // Fetch borrowed count
        if (userInfo?.token) {
            axios.get(`${ENDPOINT}/api/books/my-borrowed`, config)
                .then(res => setBorrowedCount(res.data.length))
                .catch(() => {});
        }

        // Fetch events for KPI count + sidebar panel
        axios.get(`${ENDPOINT}/api/events`)
            .then(res => {
                setEventCount(res.data.length);
                setUpcomingEvents(res.data.slice(0, 2)); // Show only 2 in sidebar
            })
            .catch(() => {});

        // Fetch all books — sort by newest first for Library Highlights
        axios.get(`${ENDPOINT}/api/books`, config)
            .then(res => {
                const sorted = [...res.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setTotalBooks(res.data.length);
                setFeaturedBooks(sorted.slice(0, 4)); // Show 4 newest additions
            })
            .catch(() => {});
    }, [userInfo]);

    const coverColors = ['placeholder-cover-1', 'placeholder-cover-2', 'placeholder-cover-3', 'placeholder-cover-4'];

    return (
        <div className="home-dashboard">
            {/* Hero Section */}
            <div className="hero-banner">
                <div className="hero-content">
                    <h1>Welcome back, {userInfo?.name || 'Student'} 👋</h1>
                    <p>You have <strong>{borrowedCount} book{borrowedCount !== 1 ? 's' : ''}</strong> currently borrowed. Stay on top of your reading!</p>
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
                        <span className="kpi-value">0</span>
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
                        <span className="kpi-value">{eventCount}</span>
                        <span className="kpi-label">Upcoming Events</span>
                    </div>
                </div>
                <div className="kpi-card" onClick={() => navigate('/books')}>
                    <div className="kpi-icon-wrapper bg-success-light text-success">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                    </div>
                    <div className="kpi-details">
                        <span className="kpi-value">{totalBooks}</span>
                        <span className="kpi-label">Available Books</span>
                    </div>
                </div>
            </div>

            {/* Bottom Content Grid */}
            <div className="content-grid">
                {/* Left Column: Library Highlights */}
                <div className="grid-main">
                    <div className="section-header">
                        <h2>New Arrivals <span style={{fontSize:'0.8rem', fontWeight:400, color:'var(--text-muted)', marginLeft:'0.5rem'}}>Latest 4 additions</span></h2>
                        <button className="btn btn-sm btn-outline" onClick={() => navigate('/books')}>View All Books</button>
                    </div>
                    <div className="books-grid">
                        {featuredBooks.length > 0 ? (
                            featuredBooks.map((book, idx) => (
                                <div className="book-card" key={book._id} onClick={() => navigate('/books')}>
                                    <div className={`book-cover ${coverColors[idx % coverColors.length]}`}></div>
                                    <div className="book-info">
                                        <h4>{book.title.length > 22 ? book.title.slice(0, 22) + '...' : book.title}</h4>
                                        <p>{book.author}</p>
                                        <span className={`pill ${book.available_copies > 0 ? 'pill-success' : 'pill-warning'}`}>
                                            {book.available_copies > 0 ? 'Available' : 'Checked Out'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '2rem', color: 'var(--text-muted)', textAlign: 'center', width: '100%' }}>
                                <p>No books found. <button className="btn btn-sm btn-outline" onClick={() => navigate('/books')}>Browse Library</button></p>
                            </div>
                        )}
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
                            {upcomingEvents.length > 0 ? (
                                upcomingEvents.map(event => {
                                    const d = new Date(event.event_date);
                                    return (
                                        <div className="list-item" key={event._id} onClick={() => navigate('/events')}>
                                            <div className="date-badge">
                                                <span className="month">{d.toLocaleString('en', { month: 'short' })}</span>
                                                <span className="day">{d.getDate()}</span>
                                            </div>
                                            <div className="item-details">
                                                <h4>{event.title}</h4>
                                                <p>{event.venue}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    No upcoming events.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Panel */}
                    <div className="dashboard-panel mt-4">
                        <div className="panel-header">
                            <h3>Recent Chats</h3>
                        </div>
                        <div className="panel-body list-wrapper">
                            <div style={{ 
                                textAlign: 'center', padding: '1.5rem 1rem', 
                                color: 'var(--text-muted)', display: 'flex', 
                                flexDirection: 'column', alignItems: 'center', gap: '0.5rem' 
                            }}>
                                <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                <p style={{ margin: 0, fontSize: '0.85rem' }}>No recent chats yet.</p>
                                <button className="btn btn-sm btn-outline" onClick={() => navigate('/chat')} style={{ marginTop: '0.25rem' }}>
                                    Join a Group
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
