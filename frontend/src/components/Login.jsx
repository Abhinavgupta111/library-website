import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        try {
            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password }, config);
            login(data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Login failed — is the server running?');
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
                    <h1>Welcome Back</h1>
                    <p>Login to the IT Department Library</p>
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

                    <div className="auth-field">
                        <label className="auth-label" htmlFor="lg-email">Email Address</label>
                        <input
                            id="lg-email"
                            type="email"
                            className="auth-input"
                            placeholder="yourname@mait.ac.in"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="auth-field">
                        <label className="auth-label" htmlFor="lg-password">Password</label>
                        <input
                            id="lg-password"
                            type="password"
                            className="auth-input"
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {/* Forgot Password Link */}
                    <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                        <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>
                            Forgot Password?
                        </Link>
                    </div>

                    <button type="submit" className="auth-submit-btn">
                        Login →
                    </button>
                </form>

                {/* Footer */}
                <div className="auth-footer">
                    New student?
                    <Link to="/signup">Create an account</Link>
                </div>

            </div>
        </div>
    );
};

export default Login;
