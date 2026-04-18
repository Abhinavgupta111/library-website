import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const ResetPassword = () => {
    const { token }               = useParams();
    const navigate                = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm]   = useState('');
    const [showPw, setShowPw]     = useState(false);
    const [msg, setMsg]           = useState(null);   // { type, text }
    const [loading, setLoading]   = useState(false);
    const [done, setDone]         = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg(null);

        if (!password || !confirm) { setMsg({ type: 'error', text: 'Please fill in both fields.' }); return; }
        if (password !== confirm)  { setMsg({ type: 'error', text: 'Passwords do not match.' }); return; }

        setLoading(true);
        try {
            const { data } = await axios.put(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
            setMsg({ type: 'success', text: data.message });
            setDone(true);
            setTimeout(() => navigate('/login'), 3000);
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
                    <h1>Set New Password</h1>
                    <p>Choose a strong password to secure your account.</p>
                </div>

                {/* Feedback */}
                {msg && (
                    <div className={`auth-alert ${msg.type === 'success' ? 'auth-alert-success' : 'auth-alert-danger'}`}>
                        <span className="auth-alert-icon">{msg.type === 'success' ? '✅' : '⚠️'}</span>
                        <span>{msg.text}</span>
                    </div>
                )}

                {done ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-sub)', marginTop: '1rem' }}>
                        Redirecting you to login…
                    </p>
                ) : (
                    <form onSubmit={handleSubmit} className="auth-form" noValidate>
                        <div className="auth-field">
                            <label className="auth-label" htmlFor="rp-password">New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="rp-password"
                                    type={showPw ? 'text' : 'password'}
                                    className="auth-input"
                                    placeholder="Min 8 chars, upper, lower, number, symbol"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(p => !p)}
                                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                                    tabIndex={-1}
                                >{showPw ? '🙈' : '👁️'}</button>
                            </div>
                        </div>

                        <div className="auth-field">
                            <label className="auth-label" htmlFor="rp-confirm">Confirm Password</label>
                            <input
                                id="rp-confirm"
                                type={showPw ? 'text' : 'password'}
                                className="auth-input"
                                placeholder="Re-enter your new password"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Password strength hint */}
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-0.25rem' }}>
                            Must contain uppercase, lowercase, number & special character (@$!%*?&)
                        </p>

                        <button type="submit" className="auth-submit-btn" disabled={loading}>
                            {loading ? 'Resetting…' : 'Reset Password →'}
                        </button>
                    </form>
                )}

                {/* Footer */}
                <div className="auth-footer">
                    <Link to="/login">← Back to Login</Link>
                </div>

            </div>
        </div>
    );
};

export default ResetPassword;
