import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSignUp } from '@clerk/clerk-react';
import './Auth.css';

const Signup = () => {
    const { signUp, setActive, isLoaded } = useSignUp();
    const navigate = useNavigate();

    const [step,     setStep]     = useState('form');   // 'form' | 'verify'
    const [name,     setName]     = useState('');
    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [code,     setCode]     = useState('');
    const [error,    setError]    = useState('');
    const [loading,  setLoading]  = useState(false);

    // ── Step 1: Create Clerk account & trigger verification email ─────────────
    const handleSignUp = async (e) => {
        e.preventDefault();
        if (!isLoaded) return;
        setError('');

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            setError('Password must be 8+ characters with uppercase, lowercase, and a digit.');
            return;
        }

        setLoading(true);
        try {
            const [firstName, ...rest] = name.trim().split(' ');
            const lastName = rest.join(' ') || '';

            await signUp.create({
                firstName,
                lastName,
                emailAddress: email,
                password,
            });

            // Send verification email
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setStep('verify');
        } catch (err) {
            setError(err.errors?.[0]?.message || err.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2: Verify the email code ─────────────────────────────────────────
    const handleVerify = async (e) => {
        e.preventDefault();
        if (!isLoaded) return;
        setError('');
        setLoading(true);
        try {
            const result = await signUp.attemptEmailAddressVerification({ code });
            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
                // Go to complete-profile to collect roll number
                navigate('/complete-profile');
            } else {
                setError('Verification incomplete. Please try again.');
            }
        } catch (err) {
            setError(err.errors?.[0]?.message || 'Invalid verification code.');
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

                {/* ── Step 2: Verify Email ── */}
                {step === 'verify' ? (
                    <>
                        <div className="auth-heading">
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📬</div>
                            <h1>Verify your email</h1>
                            <p>We sent a 6-digit code to <strong style={{ color: '#60a5fa' }}>{email}</strong></p>
                        </div>

                        {error && (
                            <div className="auth-alert auth-alert-danger">
                                <span className="auth-alert-icon">⚠️</span><span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleVerify} className="auth-form" noValidate>
                            <div className="auth-field">
                                <label className="auth-label" htmlFor="verify-code">Verification Code</label>
                                <input
                                    id="verify-code" type="text" className="auth-input"
                                    placeholder="Enter 6-digit code"
                                    value={code} onChange={e => setCode(e.target.value)}
                                    required autoComplete="one-time-code"
                                    style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.1rem' }}
                                />
                                <span className="auth-hint">Check your inbox and spam folder.</span>
                            </div>
                            <button type="submit" className="auth-submit-btn" disabled={loading}>
                                {loading ? 'Verifying…' : 'Verify & Continue →'}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <button
                                onClick={() => { setStep('form'); setError(''); }}
                                style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontWeight: 600, fontSize: '0.825rem' }}
                            >
                                ← Back to Sign Up
                            </button>
                        </div>
                    </>
                )

                /* ── Step 1: Sign-Up Form ── */
                : (
                    <>
                        <div className="auth-heading">
                            <h1>Create an Account</h1>
                            <p>Join the IT Department Library platform</p>
                        </div>

                        {error && (
                            <div className="auth-alert auth-alert-danger">
                                <span className="auth-alert-icon">⚠️</span><span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSignUp} className="auth-form" noValidate>

                            {/* Full Name */}
                            <div className="auth-field">
                                <label className="auth-label" htmlFor="su-name">Full Name</label>
                                <input
                                    id="su-name" type="text" className="auth-input"
                                    placeholder="e.g. Aryan Mehta"
                                    value={name} onChange={e => setName(e.target.value)}
                                    required autoComplete="name"
                                />
                            </div>

                            {/* Email */}
                            <div className="auth-field">
                                <label className="auth-label" htmlFor="su-email">Email Address</label>
                                <input
                                    id="su-email" type="email" className="auth-input"
                                    placeholder="yourname@mait.ac.in"
                                    value={email} onChange={e => setEmail(e.target.value)}
                                    required autoComplete="email"
                                />
                            </div>

                            {/* Password */}
                            <div className="auth-field">
                                <label className="auth-label" htmlFor="su-password">Password</label>
                                <input
                                    id="su-password" type="password" className="auth-input"
                                    placeholder="Create a strong password"
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    required autoComplete="new-password"
                                />
                                <span className="auth-hint">8+ characters · Uppercase · Lowercase · Digit</span>
                            </div>

                            <button type="submit" className="auth-submit-btn" disabled={loading || !isLoaded}>
                                {loading ? 'Creating account…' : 'Create Account →'}
                            </button>
                        </form>

                        <div className="auth-footer">
                            Already have an account?
                            <Link to="/login">Login</Link>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default Signup;
