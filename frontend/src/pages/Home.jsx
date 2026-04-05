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

    return (
        <div className="home-dashboard">

            {/* ── MAIT IT Department Branding Banner ── */}
            <div className="mait-brand-banner">
                <div className="mait-logo-block">
                    <div className="mait-logo-circle">
                        <img
                            src="/mait-logo.png"
                            alt="MAIT Logo"
                            className="mait-logo-img"
                        />
                    </div>
                    <div className="mait-brand-text">
                        <p className="mait-subtitle-top">Department of Information Technology</p>
                        <h1 className="mait-college-name">Maharaja Agrasen Institute of Technology</h1>
                        <p className="mait-subtitle-bottom">📚 IT Department Library Management System</p>
                    </div>
                </div>
                <div className="mait-badge-strip">
                    <span className="mait-badge">NAAC Accredited</span>
                    <span className="mait-badge">AICTE Approved</span>
                    <span className="mait-badge">Affiliated to GGSIPU</span>
                </div>
            </div>

            {/* ── HOD & Library Head Messages ── */}
            <div className="messages-row">
                {/* HOD Message */}
                <div className="message-card hod-card">
                    <div className="message-card-header">
                        <div className="message-avatar hod-avatar">
                            <svg viewBox="0 0 24 24" width="26" height="26" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                        </div>
                        <div>
                            <h3 className="message-card-title">HOD's Message</h3>
                            <p className="message-card-person">Head of Department — IT</p>
                        </div>
                    </div>
                    <blockquote className="message-body">
                        "Our library is a beacon for every student — a place where curiosity is nurtured and ideas take flight. Make full use of these resources to build a strong academic foundation."
                    </blockquote>
                    <p className="message-signature">— HOD, Information Technology</p>
                </div>

                {/* Library Dept Head Message */}
                <div className="message-card lib-card">
                    <div className="message-card-header">
                        <div className="message-avatar lib-avatar">
                            <svg viewBox="0 0 24 24" width="26" height="26" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                            </svg>
                        </div>
                        <div>
                            <h3 className="message-card-title">Library Head's Message</h3>
                            <p className="message-card-person">Department Library In-charge</p>
                        </div>
                    </div>
                    <blockquote className="message-body">
                        "Welcome to the IT Department Library — your gateway to reliable academic resources. Browse our curated collection of books and journals. Read widely, grow continuously."
                    </blockquote>
                    <p className="message-signature">— Library In-charge, IT Department</p>
                </div>
            </div>

            {/* ── Why Visit the Library? ── */}
            <div className="why-library-section">
                <div className="why-library-panel">
                    <div className="why-library-header">
                        <span className="why-library-badge">IT Department Library</span>
                        <h2 className="why-library-title">Why Visit the Library Instead of Reading Online?</h2>
                        <p className="why-library-subtitle">
                            Screens inform, but libraries transform.
                        </p>
                    </div>

                    <div className="why-library-grid">
                        <div className="why-card why-card-blue">
                            <div className="why-icon" style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}>
                                <svg viewBox="0 0 24 24" width="22" height="22" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                            </div>
                            <h4 className="why-card-title">Deep Focus Environment</h4>
                            <p className="why-card-desc">Quiet, distraction-free atmosphere that helps you focus and retain far more than browsing at home.</p>
                            <span className="why-card-tag">🧠 Better Retention</span>
                        </div>

                        <div className="why-card why-card-green">
                            <div className="why-icon" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                                <svg viewBox="0 0 24 24" width="22" height="22" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                                </svg>
                            </div>
                            <h4 className="why-card-title">Curated & Verified Books</h4>
                            <p className="why-card-desc">Every book is faculty-vetted — academically reliable and perfectly aligned with your syllabus.</p>
                            <span className="why-card-tag">✅ 100% Reliable</span>
                        </div>

                        <div className="why-card why-card-amber">
                            <div className="why-icon" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                                <svg viewBox="0 0 24 24" width="22" height="22" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                            </div>
                            <h4 className="why-card-title">Peer Learning & Collaboration</h4>
                            <p className="why-card-desc">Study groups foster real-time discussion and collaborative problem-solving — skills critical for exams and career.</p>
                            <span className="why-card-tag">🤝 Stronger Together</span>
                        </div>

                        <div className="why-card why-card-purple">
                            <div className="why-icon" style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' }}>
                                <svg viewBox="0 0 24 24" width="22" height="22" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                                </svg>
                            </div>
                            <h4 className="why-card-title">No Ads, Pop-ups or Paywalls</h4>
                            <p className="why-card-desc">No ads, no paywalls, no login walls — complete and uninterrupted access to full content, free of charge.</p>
                            <span className="why-card-tag">🚫 Zero Interruptions</span>
                        </div>

                        <div className="why-card why-card-red">
                            <div className="why-icon" style={{ background: 'linear-gradient(135deg,#ef4444,#b91c1c)' }}>
                                <svg viewBox="0 0 24 24" width="22" height="22" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                                </svg>
                            </div>
                            <h4 className="why-card-title">Expert Guidance On-Hand</h4>
                            <p className="why-card-desc">Faculty and library staff are always nearby to guide you to the right book — something no search engine can replace.</p>
                            <span className="why-card-tag">👩‍🏫 Personalised Help</span>
                        </div>
                    </div>

                    <div className="why-library-footer">
                        <div className="why-footer-info">
                            <span>🕘 Open: Mon – Sat &nbsp;|&nbsp; 9:00 AM – 5:00 PM</span>
                            <span>📍 Ground Floor, IT Block, MAIT</span>
                        </div>
                        <button className="btn btn-sm btn-outline" onClick={() => navigate('/books')}>Browse Collection →</button>
                    </div>
                </div>
            </div>

            {/* ── Hero Banner ── */}
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

                <div className="grid-sidebar">
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
