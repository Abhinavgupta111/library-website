import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

const ENDPOINT = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Settings = () => {
    const { userInfo, syncWithBackend } = useAuth();
    const { signOut } = useClerk();
    const navigate = useNavigate();

    // Form fields
    const [name,        setName]        = useState('');
    const [branch,      setBranch]      = useState('');
    const [year,        setYear]        = useState('');
    const [roll_number, setRollNumber]  = useState('');

    // Status
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error,   setError]   = useState(null);

    useEffect(() => {
        if (!userInfo) return;
        setName(userInfo.name || '');
        setBranch(userInfo.branch || '');
        setYear(userInfo.year || '');
        setRollNumber(userInfo.roll_number || '');
    }, [userInfo]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        setLoading(true);

        try {
            await axios.put(`${ENDPOINT}/api/auth/profile`, { name, branch, year, roll_number });
            // Re-sync context with fresh data
            await syncWithBackend({ branch, year, roll_number });
            setMessage('Profile updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    if (!userInfo) return <div className="settings-container"><p>Please log in to view settings.</p></div>;

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h2>Account &amp; Settings</h2>
                <p>Manage your campus profile details.</p>
            </div>

            <div className="settings-card dark-glass">
                {message && <div className="settings-alert success">{message}</div>}
                {error   && <div className="settings-alert error">{error}</div>}

                <form onSubmit={submitHandler} className="settings-form">

                    {/* SECTION: Personal Details */}
                    <div className="settings-section">
                        <h3>Personal Information</h3>
                        <div className="settings-grid">
                            <div className="input-group">
                                <label>Full Name</label>
                                <input
                                    type="text" value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Enter your name" required
                                />
                            </div>
                            <div className="input-group">
                                <label>Email Address</label>
                                <input
                                    type="email" value={userInfo.email}
                                    disabled
                                    style={{ opacity: 0.5, cursor: 'not-allowed' }}
                                    title="Email is managed by your Clerk account"
                                />
                                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                                    Email is managed by your authentication provider.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* SECTION: Academic details */}
                    <div className="settings-section">
                        <h3>Academic Details</h3>
                        <div className="settings-grid">
                            <div className="input-group">
                                <label>Branch / Department</label>
                                <select value={branch} onChange={e => setBranch(e.target.value)}>
                                    <option value="">Select Branch</option>
                                    <option value="IT">Information Technology</option>
                                    <option value="CSE">Computer Science</option>
                                    <option value="ECE">Electronics</option>
                                    <option value="ME">Mechanical</option>
                                    <option value="CE">Civil</option>
                                    <option value="EE">Electrical</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Year</label>
                                <select value={year} onChange={e => setYear(e.target.value)}>
                                    <option value="">Select Year</option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Roll Number</label>
                                <input
                                    type="text" value={roll_number}
                                    onChange={e => setRollNumber(e.target.value)}
                                    placeholder="Enter Roll / Enrollment No."
                                    style={{ textTransform: 'uppercase' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION: Security — handled by Clerk */}
                    <div className="settings-section">
                        <h3>Security</h3>
                        <p className="settings-subtext">
                            Password changes and account security are managed through your Clerk account. 
                            Use the <strong>"Forgot Password?"</strong> link on the login page to reset your password.
                        </p>
                    </div>

                    <div className="settings-actions">
                        <button type="button" className="settings-btn-logout" onClick={handleLogout}>
                            🚪 Logout
                        </button>
                        <button type="submit" className="settings-btn-save" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
