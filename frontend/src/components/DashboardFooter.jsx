import React from 'react';
import { Link } from 'react-router-dom';
import './DashboardFooter.css';

const DashboardFooter = () => {
    const year = new Date().getFullYear();
    return (
        <footer className="dashboard-footer">
            <div className="dashboard-footer-inner">
                <p className="dashboard-footer-copy">
                    © {year} Maharaja Agrasen Institute of Technology · Library Services
                </p>
                <nav className="dashboard-footer-nav" aria-label="Footer">
                    <Link to="/books">Catalogue</Link>
                    <Link to="/events">Events</Link>
                    <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Back to top</a>
                </nav>
            </div>
        </footer>
    );
};

export default DashboardFooter;
