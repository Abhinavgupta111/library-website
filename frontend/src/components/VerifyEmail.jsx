import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            try {
                const { data } = await axios.get(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/verify-email/${token}`
                );
                setMessage(data.message);
                setStatus('success');
            } catch (err) {
                setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.');
                setStatus('error');
            }
        };
        if (token) verify();
        else setStatus('error'), setMessage('No verification token found in the URL.');
    }, [token]);

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ textAlign: 'center' }}>

                {/* Brand */}
                <div className="auth-brand">
                    <div className="auth-brand-icon">📚</div>
                    <span className="auth-brand-name">MAIT Library</span>
                </div>

                {status === 'loading' && (
                    <>
                        <div style={{
                            width: 48, height: 48, margin: '1rem auto',
                            border: '3px solid rgba(255,255,255,0.1)',
                            borderTop: '3px solid #3b82f6',
                            borderRadius: '50%',
                            animation: 'auth-spin 0.8s linear infinite'
                        }} />
                        <style>{`@keyframes auth-spin { to { transform: rotate(360deg); } }`}</style>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Verifying your email…</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                        <h1 style={{ color: '#f8fafc', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                            Email Verified!
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                            {message}
                        </p>
                        <Link to="/login" className="auth-submit-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                            Go to Login →
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                        <h1 style={{ color: '#f8fafc', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                            Verification Failed
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                            {message}
                        </p>
                        <Link to="/signup" className="auth-submit-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                            Register Again →
                        </Link>
                    </>
                )}

            </div>
        </div>
    );
};

export default VerifyEmail;
