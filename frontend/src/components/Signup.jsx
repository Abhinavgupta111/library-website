import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const Signup = () => {
    const [name,     setName]     = useState('');
    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [branch,   setBranch]   = useState('IT');
    const [year,     setYear]     = useState(1);
    const [error,    setError]    = useState('');
    const [loading,  setLoading]  = useState(false);
    const [sent,     setSent]     = useState(false); // true after verification email sent

    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');

        if (!name || !email || !password) {
            setError('Please complete all required fields.');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            setError('Password must be 8+ chars with uppercase, lowercase, digit & special character.');
            return;
        }

        setLoading(true);
        try {
            const config = { headers: { 'Content-Type': 'application/json' }, timeout: 25000 };
            await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`,
                { name, email, password, branch, year: Number(year) },
                config
            );
            setSent(true); // Show the "check your email" screen
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Registration failed — is the server running?');
        } finally {
            setLoading(false);
        }
    };

    // ── Email-sent confirmation screen ─────────────────────────────────────────
    if (sent) {
        return (
            <div className="auth-page">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
                    <h1 style={{ color: '#f8fafc', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                        Check your inbox!
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                        We sent a verification link to <strong style={{ color: '#60a5fa' }}>{email}</strong>.<br />
                        Click the link to activate your account. It expires in 24 hours.
                    </p>
                    <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                        Didn't receive it? Check your spam folder.
                    </p>
                    <Link to="/login" className="auth-submit-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                        ← Back to Login
                    </Link>
                </div>
            </div>
        );
    }

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
                    <h1>Create an Account</h1>
                    <p>Join the IT Department Library platform</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="auth-alert auth-alert-danger">
                        <span className="auth-alert-icon">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={submitHandler} className="auth-form" noValidate>

                    {/* Full Name */}
                    <div className="auth-field">
                        <label className="auth-label" htmlFor="su-name">Full Name</label>
                        <input
                            id="su-name"
                            type="text"
                            className="auth-input"
                            placeholder="e.g. Aryan Mehta"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            autoComplete="name"
                        />
                    </div>

                    {/* Email */}
                    <div className="auth-field">
                        <label className="auth-label" htmlFor="su-email">Email Address</label>
                        <input
                            id="su-email"
                            type="email"
                            className="auth-input"
                            placeholder="yourname@mait.ac.in"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    {/* Password */}
                    <div className="auth-field">
                        <label className="auth-label" htmlFor="su-password">Password</label>
                        <input
                            id="su-password"
                            type="password"
                            name="password"
                            className="auth-input"
                            placeholder="Create a strong password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                        <span className="auth-hint">
                            8+ characters · Uppercase · Lowercase · Digit · Special symbol (@$!%*?&)
                        </span>
                    </div>

                    {/* Branch + Year — side by side */}
                    <div className="auth-form-row">
                        <div className="auth-field">
                            <label className="auth-label" htmlFor="su-branch">Branch</label>
                            <div className="auth-select-wrap">
                                <select
                                    id="su-branch"
                                    className="auth-input auth-select"
                                    value={branch}
                                    onChange={e => setBranch(e.target.value)}
                                >
                                    <option value="IT">Information Technology</option>
                                    <option value="CSE">Computer Science</option>
                                    <option value="ECE">Electronics</option>
                                    <option value="ME">Mechanical</option>
                                </select>
                            </div>
                        </div>

                        <div className="auth-field">
                            <label className="auth-label" htmlFor="su-year">Year</label>
                            <div className="auth-select-wrap">
                                <select
                                    id="su-year"
                                    className="auth-input auth-select"
                                    value={year}
                                    onChange={e => setYear(e.target.value)}
                                >
                                    <option value={1}>1st Year</option>
                                    <option value={2}>2nd Year</option>
                                    <option value={3}>3rd Year</option>
                                    <option value={4}>4th Year</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? 'Creating account…' : 'Create Account →'}
                    </button>
                </form>

                {/* Footer */}
                <div className="auth-footer">
                    Already have an account?
                    <Link to="/login">Login</Link>
                </div>

            </div>
        </div>
    );
};

export default Signup;
