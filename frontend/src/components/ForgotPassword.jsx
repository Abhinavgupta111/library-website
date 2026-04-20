import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail]     = useState('');
    const [msg, setMsg]         = useState(null);   // { type: 'success'|'error', text }
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg(null);
        if (!email) { setMsg({ type: 'error', text: 'Please enter your email address.' }); return; }

        setLoading(true);
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/forgot-password`, { email });
            setMsg({ type: 'success', text: data.message });
            setEmail('');
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Something went wrong. Try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                {/* Brand */}
                <div className="auth-brand">
                    <div className="auth-brand-icon">📚</div>
                    <span className="auth-brand-name">MAIT Library</span>
                </div>

                {/* Heading */}
                <div className="auth-heading">
                    <h1>Forgot Password?</h1>
                    <p>Enter your registered email and we'll send you a reset link.</p>
                </div>

                {/* Feedback */}
                {msg && (
                    <div className={`auth-alert ${msg.type === 'success' ? 'auth-alert-success' : 'auth-alert-danger'}`}>
                        <span className="auth-alert-icon">{msg.type === 'success' ? '✅' : '⚠️'}</span>
                        <span>{msg.text}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    <div className="auth-field">
                        <label className="auth-label" htmlFor="fp-email">Email Address</label>
                        <input
                            id="fp-email"
                            type="email"
                            className="auth-input"
                            placeholder="yourname@mait.ac.in"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? 'Sending…' : 'Send Reset Link →'}
                    </button>
                </form>

                {/* Footer */}
                <div className="auth-footer">
                    <Link to="/login">← Back to Login</Link>
                </div>

            </div>
        </div>
    );
};

export default ForgotPassword;
