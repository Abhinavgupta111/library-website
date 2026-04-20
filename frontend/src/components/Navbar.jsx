import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        setIsOpen(false);
        navigate('/login');
    };

    const closeMenu = () => setIsOpen(false);

    return (
        <>
            <nav className="navbar glass-panel">
                <div className="navbar-brand">
                    <Link to="/" onClick={closeMenu}>
                        <span className="logo-icon">📚</span>
                        <span className="logo-text">MAIT Library</span>
                    </Link>
                </div>

                {/* Hamburger button — visible only on mobile */}
                <button
                    className={`hamburger-btn ${isOpen ? 'hamburger-open' : ''}`}
                    onClick={() => setIsOpen(v => !v)}
                    aria-label="Toggle navigation menu"
                    aria-expanded={isOpen}
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>

                {/* Nav links — slide-in drawer on mobile */}
                <div className={`navbar-links ${isOpen ? 'navbar-links-open' : ''}`}>
                    <div className="mobile-menu-header">
                        <span className="logo-icon">📚</span>
                        <span className="logo-text">MAIT Library</span>
                        <button className="close-menu-btn" onClick={closeMenu} aria-label="Close menu">✕</button>
                    </div>
                    <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
                    <Link to="/books" className="nav-link" onClick={closeMenu}>Books</Link>
                    <Link to="/events" className="nav-link" onClick={closeMenu}>Events</Link>
                    <Link to="/chat" className="nav-link" onClick={closeMenu}>Chat</Link>
                    {userInfo ? (
                        <div className="user-menu">
                            <span className="user-name">{userInfo.name} ({userInfo.role})</span>
                            <button className="btn btn-outline" onClick={logoutHandler}>Logout</button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary" onClick={closeMenu}>Login</Link>
                    )}
                </div>
            </nav>

            {/* Overlay backdrop — closes menu on tap */}
            {isOpen && <div className="nav-overlay" onClick={closeMenu}></div>}
        </>
    );
};

export default Navbar;
