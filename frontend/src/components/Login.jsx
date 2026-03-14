import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Card from './Card';
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
            setError('Please enter both email and password');
            return;
        }

        try {
            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password }, config);
            login(data);
            navigate('/');
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Login failed - Server disconnected?';
            console.error("Login Submission Error:", err);
            setError(errorMessage);
        }
    };

    return (
        <div className="auth-container">
            <Card title="Login to Campus" subtitle="Welcome back to the Smart Campus Library" className="auth-card">
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={submitHandler} className="auth-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            className="form-control glass-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            className="form-control glass-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">Login</button>
                </form>
                <div className="auth-footer">
                    New student? <Link to="/signup">Register here</Link>
                </div>
            </Card>
        </div>
    );
};

export default Login;
