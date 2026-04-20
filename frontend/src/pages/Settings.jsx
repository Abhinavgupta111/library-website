import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

const ENDPOINT = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Settings = () => {
    const { userInfo, login, logout } = useAuth();
    const navigate = useNavigate();
    
    // Form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [branch, setBranch] = useState('');
    const [year, setYear] = useState('');
    const [roll_number, setRollNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Status
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const authConfig = userInfo?.token
        ? { headers: { Authorization: `Bearer ${userInfo.token}` } }
        : {};

    useEffect(() => {
        if (!userInfo) return;
        
        // Fetch fresh profile data to pre-fill
        const fetchProfile = async () => {
            try {
                const { data } = await axios.get(`${ENDPOINT}/api/auth/profile`, authConfig);
                setName(data.name || '');
                setEmail(data.email || '');
                setBranch(data.branch || '');
                setYear(data.year || '');
                setRollNumber(data.roll_number || '');
            } catch (err) {
                console.error("Failed to load profile", err);
            }
        };

        fetchProfile();
    }, [userInfo]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const updateData = { name, email, branch, year, roll_number };
            if (password) updateData.password = password;

            const { data } = await axios.put(`${ENDPOINT}/api/auth/profile`, updateData, authConfig);
            
            // Re-login to update context with fresh token and details
            login(data);
            
            setMessage('Profile updated successfully!');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
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
                {error && <div className="settings-alert error">{error}</div>}

                <form onSubmit={submitHandler} className="settings-form">
                    
                    {/* SECTION: Personal Details */}
                    <div className="settings-section">
                        <h3>Personal Information</h3>
                        <div className="settings-grid">
                            <div className="input-group">
                                <label>Full Name</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    placeholder="Enter your name"
                                    required 
                                />
                            </div>
                            <div className="input-group">
                                <label>Email Address</label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    placeholder="Enter academic email"
                                    required 
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION: Academic details */}
                    <div className="settings-section">
                        <h3>Academic Details</h3>
                        <div className="settings-grid">
                            <div className="input-group">
                                <label>Branch / Department</label>
                                <input 
                                    type="text" 
                                    value={branch} 
                                    onChange={(e) => setBranch(e.target.value)} 
                                    placeholder="e.g. Information Technology"
                                />
                            </div>
                            <div className="input-group">
                                <label>Year</label>
                                <select value={year} onChange={(e) => setYear(e.target.value)}>
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
                                    type="text" 
                                    value={roll_number} 
                                    onChange={(e) => setRollNumber(e.target.value)} 
                                    placeholder="Enter Roll / Enrollment No."
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION: Security */}
                    <div className="settings-section">
                        <h3>Security</h3>
                        <p className="settings-subtext">Leave blank to keep your current password.</p>
                        <div className="settings-grid">
                            <div className="input-group">
                                <label>New Password</label>
                                <input 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div className="input-group">
                                <label>Confirm Password</label>
                                <input 
                                    type="password" 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="settings-actions">
                        <button
                            type="button"
                            className="settings-btn-logout"
                            onClick={() => { logout(); navigate('/login'); }}
                        >
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
