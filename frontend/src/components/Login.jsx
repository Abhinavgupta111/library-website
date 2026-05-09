import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSignIn } from '@clerk/clerk-react';
import './Auth.css';

const Login = () => {
    const { signIn, setActive, isLoaded } = useSignIn();
    const navigate = useNavigate();

    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [error,    setError]    = useState('');
    const [loading,  setLoading]  = useState(false);

    // Forgot-password flow states
    const [forgotMode,   setForgotMode]   = useState(false);
    const [resetSent,    setResetSent]    = useState(false);
    const [resetCode,    setResetCode]    = useState('');
    const [newPassword,  setNewPassword]  = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);

    // ── Sign In ──────────────────────────────────────────────────────────────
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!isLoaded) return;
        setError('');
        setLoading(true);
        try {
            const result = await signIn.create({ identifier: email, password });
            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
                navigate('/');
            }
        } catch (err) {
            const msg = err.errors?.[0]?.message || err.message || 'Login failed.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // ── Forgot Password — Step 1: send code ─────────────────────────────────
    const handleSendReset = async (e) => {
        e.preventDefault();
        if (!isLoaded) return;
        setError('');
        setLoading(true);
        try {
            await signIn.create({ identifier: email });
            await signIn.prepareFirstFactor({ strategy: 'reset_password_email_code', emailAddressId: signIn.supportedFirstFactors.find(f => f.strategy === 'reset_password_email_code')?.emailAddressId });
            setResetSent(true);
        } catch (err) {
            setError(err.errors?.[0]?.message || 'Could not send reset email.');
        } finally {
            setLoading(false);
        }
    };

    // ── Forgot Password — Step 2: verify code + set new password ────────────
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!isLoaded) return;
        setError('');
        setLoading(true);
        try {
            const result = await signIn.attemptFirstFactor({
                strategy: 'reset_password_email_code',
                code: resetCode,
                password: newPassword,
            });
            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
                setResetSuccess(true);
                setTimeout(() => navigate('/'), 1500);
            }
        } catch (err) {
            setError(err.errors?.[0]?.message || 'Password reset failed.');
        } finally {
            setLoading(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="auth-page">
            <div className="auth-card">

                {/* Brand */}
                <div className="auth-brand">
                    <div className="auth-brand-icon">📚</div>
                    <span className="auth-brand-name">MAIT Library</span>
                </div>

                {/* ── Forgot Password: Success ── */}
                {resetSuccess ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
                        <h1 className="auth-heading" style={{ fontSize: '1.3rem', color: '#f8fafc' }}>Password reset!</h1>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Redirecting you to the dashboard…</p>
                    </div>
                )

                /* ── Forgot Password: Enter Code + New Password ── */
                : forgotMode && resetSent ? (
                    <>
                        <div className="auth-heading">
                            <h1>Set new password</h1>
                            <p>Enter the code we emailed to <strong style={{ color: '#60a5fa' }}>{email}</strong></p>
                        </div>
                        {error && (
                            <div className="auth-alert auth-alert-danger">
                                <span className="auth-alert-icon">⚠️</span><span>{error}</span>
                            </div>
                        )}
                        <form onSubmit={handleResetPassword} className="auth-form" noValidate>
                            <div className="auth-field">
                                <label className="auth-label" htmlFor="reset-code">Verification Code</label>
                                <input id="reset-code" type="text" className="auth-input"
                                    placeholder="6-digit code from email"
                                    value={resetCode} onChange={e => setResetCode(e.target.value)} required />
                            </div>
                            <div className="auth-field">
                                <label className="auth-label" htmlFor="new-pass">New Password</label>
                                <input id="new-pass" type="password" className="auth-input"
                                    placeholder="Create a strong password"
                                    value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                                <span className="auth-hint">8+ chars · Uppercase · Lowercase · Digit</span>
                            </div>
                            <button type="submit" className="auth-submit-btn" disabled={loading}>
                                {loading ? 'Resetting…' : 'Reset Password →'}
                            </button>
                        </form>
                        <div className="auth-footer">
                            <button onClick={() => { setForgotMode(false); setResetSent(false); setError(''); }}
                                style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontWeight: 600, fontSize: '0.825rem' }}>
                                ← Back to Login
                            </button>
                        </div>
                    </>
                )

                /* ── Forgot Password: Enter Email ── */
                : forgotMode ? (
                    <>
                        <div className="auth-heading">
                            <h1>Forgot Password?</h1>
                            <p>Enter your email — we'll send you a reset code.</p>
                        </div>
                        {error && (
                            <div className="auth-alert auth-alert-danger">
                                <span className="auth-alert-icon">⚠️</span><span>{error}</span>
                            </div>
                        )}
                        <form onSubmit={handleSendReset} className="auth-form" noValidate>
                            <div className="auth-field">
                                <label className="auth-label" htmlFor="fp-email">Email Address</label>
                                <input id="fp-email" type="email" className="auth-input"
                                    placeholder="yourname@mait.ac.in"
                                    value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                            </div>
                            <button type="submit" className="auth-submit-btn" disabled={loading}>
                                {loading ? 'Sending…' : 'Send Reset Code →'}
                            </button>
                        </form>
                        <div className="auth-footer">
                            <button onClick={() => { setForgotMode(false); setError(''); }}
                                style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontWeight: 600, fontSize: '0.825rem' }}>
                                ← Back to Login
                            </button>
                        </div>
                    </>
                )

                /* ── Normal Login ── */
                : (
                    <>
                        <div className="auth-heading">
                            <h1>Welcome Back</h1>
                            <p>Login to the IT Department Library</p>
                        </div>

                        {error && (
                            <div className="auth-alert auth-alert-danger">
                                <span className="auth-alert-icon">⚠️</span><span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="auth-form" noValidate>
                            <div className="auth-field">
                                <label className="auth-label" htmlFor="lg-email">Email Address</label>
                                <input
                                    id="lg-email" type="email" className="auth-input"
                                    placeholder="yourname@mait.ac.in"
                                    value={email} onChange={e => setEmail(e.target.value)}
                                    required autoComplete="email"
                                />
                            </div>
                            <div className="auth-field">
                                <label className="auth-label" htmlFor="lg-password">Password</label>
                                <input
                                    id="lg-password" type="password" className="auth-input"
                                    placeholder="Enter your password"
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    required autoComplete="current-password"
                                />
                            </div>

                            <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
                                <button type="button"
                                    onClick={() => { setForgotMode(true); setError(''); }}
                                    style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                                    Forgot Password?
                                </button>
                            </div>

                            <button type="submit" className="auth-submit-btn" disabled={loading || !isLoaded}>
                                {loading ? 'Signing in…' : 'Login →'}
                            </button>
                        </form>

                        <div className="auth-footer">
                            New student?
                            <Link to="/signup">Create an account</Link>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default Login;
