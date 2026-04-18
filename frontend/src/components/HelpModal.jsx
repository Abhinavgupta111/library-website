import React, { useEffect } from 'react';
import './HelpModal.css';

const HelpModal = ({ type, onClose }) => {
    
    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Content based on type
    let title = "";
    let content = null;

    if (type === 'borrow') {
        title = "How to Borrow a Book";
        content = (
            <div className="help-content blur-glass">
                <ol className="help-list">
                    <li>Navigate to the <strong>Library</strong> tab using the sidebar.</li>
                    <li>Search for a book by title, author, or publisher.</li>
                    <li>Currently, digital borrowing is handled manually via the library branch. Note the physical shelf ID.</li>
                    <li>Your tracked sessions and books read are available in the <strong>Home</strong> dashboard Check-out widget.</li>
                </ol>
            </div>
        );
    } else if (type === 'chat') {
        title = "Using Campus Chat Groups";
        content = (
            <div className="help-content blur-glass">
                <p>Stay connected with your section through our dynamic socket-based Campus Talk!</p>
                <ul className="help-list disc">
                    <li>Click the <strong>Campus Talk</strong> icon in the sidebar.</li>
                    <li>Select your official IT Section group to join the room.</li>
                    <li>Message history is fetched securely. Type and hit enter for real-time interactions!</li>
                </ul>
            </div>
        );
    } else if (type === 'events') {
        title = "Viewing Upcoming Events";
        content = (
            <div className="help-content blur-glass">
                <p>Campus events and seminars are curated directly by college faculty.</p>
                <ul className="help-list disc">
                    <li>Visit the <strong>Events</strong> page via the sidebar.</li>
                    <li>Events highlighted with <span style={{color:'#ef4444'}}>Red</span> are happening within 3 days.</li>
                    <li><span style={{color:'#f59e0b'}}>Yellow</span> highlights are within the next 7 days, and <span style={{color:'#6366f1'}}>Purple</span> are further out.</li>
                </ul>
            </div>
        );
    } else if (type === 'settings') {
        title = "Account & Settings";
        content = (
            <div className="help-content blur-glass">
                <div className="settings-stub">
                    <p>Settings panel is coming soon! You will be able to configure:</p>
                    <ul className="help-list disc">
                        <li>Profile Picture & Display Name</li>
                        <li>Notification Preferences</li>
                        <li>Account Security (Password reset)</li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container dark-glass" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close" onClick={onClose} title="Close">&times;</button>
                </div>
                <div className="modal-body">
                    {content}
                </div>
                <div className="modal-footer">
                    <button className="modal-btn-primary" onClick={onClose}>Got it</button>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;
