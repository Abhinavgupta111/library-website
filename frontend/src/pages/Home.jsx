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

        if (userInfo?.token) {
            axios.get(`${ENDPOINT}/api/books/my-borrowed`, config)
                .then(res => setBorrowedCount(res.data.length))
                .catch(() => {});
        }

        axios.get(`${ENDPOINT}/api/events`)
            .then(res => {
                setEventCount(res.data.length);
                setUpcomingEvents(res.data.slice(0, 2));
            })
            .catch(() => {});

        axios.get(`${ENDPOINT}/api/books`, config)
            .then(res => {
                const sorted = [...res.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setTotalBooks(res.data.length);
                setFeaturedBooks(sorted.slice(0, 4));
            })
            .catch(() => {});
    }, [userInfo]);

    const coverColors = ['placeholder-cover-1', 'placeholder-cover-2', 'placeholder-cover-3', 'placeholder-cover-4'];

    const kpiKey = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.currentTarget.click();
        }
    };

    return (
        <div className="home-dashboard">
            <div className="hero-banner">
                <div className="hero-grid">
                    <div className="hero-copy">
                        <p className="hero-eyebrow">Maharaja Agrasen Institute of Technology</p>
                        <h1 className="hero-title">Welcome back, {userInfo?.name || 'Student'}</h1>
                        <p className="hero-lead">
                            You have <strong>{borrowedCount} book{borrowedCount !== 1 ? 's' : ''}</strong> on loan.
                            Explore the catalogue, join a discussion, and stay current with campus events.
                        </p>
                        <div className="hero-actions">
                            <button type="button" className="btn btn-hero-primary" onClick={() => navigate('/books')}>
                                Browse library
                            </button>
                            <button type="button" className="btn btn-hero-ghost" onClick={() => navigate('/chat')}>
                                Campus chat
                            </button>
                        </div>
                    </div>
                    <div className="hero-showcase">
                        <div className="hero-showcase-bg" aria-hidden="true" />
                        <div className="hero-stat-card">
                            <span className="hero-stat-label">Digital catalogue</span>
                            <span className="hero-stat-value" aria-live="polite">{totalBooks}</span>
                            <span className="hero-stat-hint">titles available for discovery</span>
                        </div>
                        <div className="hero-badge" aria-hidden="true">
                            <span className="hero-badge-dot" />
                            Library network online
                        </div>
                    </div>
                </div>
            </div>

            <div className="kpi-grid">
                <div
                    className="kpi-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate('/books')}
                    onKeyDown={kpiKey}
                >
                    <div className="kpi-icon-wrapper bg-primary-light text-primary">
                        <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                        </svg>
                    </div>
                    <div className="kpi-details">
                        <span className="kpi-value">{borrowedCount}</span>
                        <span className="kpi-label">Books borrowed</span>
                    </div>
                </div>
                <div
                    className="kpi-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate('/chat')}
                    onKeyDown={kpiKey}
                >
                    <div className="kpi-icon-wrapper kpi-icon-chat bg-accent-light">
                        <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </div>
                    <div className="kpi-details">
                        <span className="kpi-value">0</span>
                        <span className="kpi-label">Unread messages</span>
                    </div>
                </div>
                <div
                    className="kpi-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate('/events')}
                    onKeyDown={kpiKey}
                >
                    <div className="kpi-icon-wrapper bg-warning-light text-warning">
                        <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </div>
                    <div className="kpi-details">
                        <span className="kpi-value">{eventCount}</span>
                        <span className="kpi-label">Upcoming events</span>
                    </div>
                </div>
                <div
                    className="kpi-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate('/books')}
                    onKeyDown={kpiKey}
                >
                    <div className="kpi-icon-wrapper bg-success-light text-success">
                        <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                    </div>
                    <div className="kpi-details">
                        <span className="kpi-value">{totalBooks}</span>
                        <span className="kpi-label">Catalogue titles</span>
                    </div>
                </div>
            </div>

            <div className="content-grid">
                <div className="grid-main">
                    <div className="section-header">
                        <div className="section-title-block">
                            <h2>New arrivals</h2>
                            <span className="section-hint">Latest additions</span>
                        </div>
                        <button type="button" className="btn btn-sm btn-outline" onClick={() => navigate('/books')}>
                            View all books
                        </button>
                    </div>
                    <div className="books-grid">
                        {featuredBooks.length > 0 ? (
                            featuredBooks.map((book, idx) => (
                                <div className="book-card" key={book._id} onClick={() => navigate('/books')}>
                                    <div className={`book-cover ${coverColors[idx % coverColors.length]}`} />
                                    <div className="book-info">
                                        <h4>{book.title.length > 22 ? book.title.slice(0, 22) + '…' : book.title}</h4>
                                        <p>{book.author}</p>
                                        <span className={`pill ${book.available_copies > 0 ? 'pill-success' : 'pill-warning'}`}>
                                            {book.available_copies > 0 ? 'Available' : 'Checked out'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="home-empty-state">
                                <p>No books found.</p>
                                <button type="button" className="btn btn-sm btn-outline" onClick={() => navigate('/books')}>
                                    Browse library
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid-sidebar">
                    <div className="dashboard-panel panel-elevated">
                        <div className="panel-header panel-header-accent">
                            <h3>Upcoming events</h3>
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
                                <div className="panel-empty">No upcoming events.</div>
                            )}
                        </div>
                    </div>

                    <div className="dashboard-panel panel-elevated mt-4">
                        <div className="panel-header panel-header-accent">
                            <h3>Recent chats</h3>
                        </div>
                        <div className="panel-body list-wrapper">
                            <div className="panel-empty panel-empty--icon">
                                <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                <p>No recent chats yet.</p>
                                <button type="button" className="btn btn-sm btn-outline" onClick={() => navigate('/chat')}>
                                    Join a group
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
