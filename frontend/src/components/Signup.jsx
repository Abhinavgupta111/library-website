import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Card from './Card';
import './Auth.css';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [branch, setBranch] = useState('CSE');
    const [year, setYear] = useState(1);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');

        if (!name || !email || !password) {
            setError('Please complete all required fields');
            return;
        }

        try {
            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.post('http://localhost:5000/api/auth/register',
                { name, email, password, branch, year: Number(year) },
                config
            );
            login(data);
            navigate('/');
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Registration failed - Server disconnected?';
            console.error("Signup Submission Error:", err);
            setError(errorMessage);
        }
    };

    return (
        <div className="auth-container">
            <Card title="Student Registration" subtitle="Create your Smart Campus profile" className="auth-card">
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={submitHandler} className="auth-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" className="form-control glass-input" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" className="form-control glass-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" className="form-control glass-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Branch</label>
                        <select className="form-control glass-input" value={branch} onChange={(e) => setBranch(e.target.value)}>
                            <option value="CSE">Computer Science</option>
                            <option value="IT">Information Technology</option>
                            <option value="ECE">Electronics</option>
                            <option value="ME">Mechanical</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Year</label>
                        <select className="form-control glass-input" value={year} onChange={(e) => setYear(e.target.value)}>
                            <option value={1}>1st Year</option>
                            <option value={2}>2nd Year</option>
                            <option value={3}>3rd Year</option>
                            <option value={4}>4th Year</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">Register</button>
                </form>
                <div className="auth-footer">
                    Already have an account? <Link to="/login">Login here</Link>
                </div>
            </Card>
        </div>
    );
};

export default Signup;
