import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    return (
        <nav className="navbar glass-panel">
            <div className="navbar-brand">
                <Link to="/">
                    <span className="logo-icon">📚</span>
                    <span className="logo-text">Smart Campus</span>
                </Link>
            </div>
            <div className="navbar-links">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/books" className="nav-link">Books</Link>
                <Link to="/events" className="nav-link">Events</Link>
                <Link to="/chat" className="nav-link">Chat</Link>
                {userInfo ? (
                    <div className="user-menu">
                        <span className="user-name">{userInfo.name} ({userInfo.role})</span>
                        <button className="btn btn-outline" onClick={logoutHandler}>Logout</button>
                    </div>
                ) : (
                    <Link to="/login" className="btn btn-primary">Login</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
