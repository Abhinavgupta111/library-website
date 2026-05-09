import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../components/Auth.css';

const CompleteProfile = () => {
    const { syncWithBackend } = useAuth();
    const navigate = useNavigate();

    const [rollNumber, setRollNumber] = useState('');
    const [branch,     setBranch]     = useState('IT');
    const [year,       setYear]       = useState(1);
    const [error,      setError]      = useState('');
    const [loading,    setLoading]    = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!rollNumber.trim()) {
            setError('Please enter your MAIT roll number.');
            return;
        }

        setLoading(true);
        try {
            const profile = await syncWithBackend({
                branch,
                year: Number(year),
                roll_number: rollNumber.trim().toUpperCase(),
            });

            if (profile) {
                navigate('/');
            } else {
                setError('Failed to save profile. Please try again.');
            }
        } catch {
            setError('Something went wrong. Please try again.');
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
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
                    <h1>Complete your profile</h1>
                    <p>Just a few more details to set up your library account</p>
                </div>

                {/* Progress indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
                    {['Account', 'Verify', 'Profile'].map((step, i) => (
                        <React.Fragment key={step}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.35rem',
                                color: i === 2 ? '#3b82f6' : '#334155',
                                fontWeight: i === 2 ? 700 : 400,
                                fontSize: '0.78rem',
                            }}>
                                <div style={{
                                    width: 22, height: 22, borderRadius: '50%',
                                    background: i < 2 ? '#10b981' : (i === 2 ? '#3b82f6' : '#1e293b'),
                                    border: i === 2 ? '2px solid #3b82f6' : '2px solid transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.7rem', fontWeight: 700, color: 'white',
                                }}>
                                    {i < 2 ? '✓' : (i + 1)}
                                </div>
                                {step}
                            </div>
                            {i < 2 && (
                                <div style={{ flex: 1, height: 2, background: i < 1 ? '#10b981' : '#1e293b', maxWidth: 32, borderRadius: 4 }} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="auth-alert auth-alert-danger">
                        <span className="auth-alert-icon">⚠️</span><span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="auth-form" noValidate>

                    {/* Roll Number */}
                    <div className="auth-field">
                        <label className="auth-label" htmlFor="roll-number">
                            MAIT Roll Number <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            id="roll-number"
                            type="text"
                            className="auth-input"
                            placeholder="e.g. 04715803121"
                            value={rollNumber}
                            onChange={e => setRollNumber(e.target.value)}
                            required
                            autoComplete="off"
                            style={{ textTransform: 'uppercase' }}
                        />
                        <span className="auth-hint">Your university examination roll number</span>
                    </div>

                    {/* Branch + Year — side by side */}
                    <div className="auth-form-row">
                        <div className="auth-field">
                            <label className="auth-label" htmlFor="cp-branch">Branch</label>
                            <div className="auth-select-wrap">
                                <select
                                    id="cp-branch"
                                    className="auth-input auth-select"
                                    value={branch}
                                    onChange={e => setBranch(e.target.value)}
                                >
                                    <option value="IT">Information Technology</option>
                                    <option value="CSE">Computer Science</option>
                                    <option value="ECE">Electronics</option>
                                    <option value="ME">Mechanical</option>
                                    <option value="CE">Civil</option>
                                    <option value="EE">Electrical</option>
                                </select>
                            </div>
                        </div>

                        <div className="auth-field">
                            <label className="auth-label" htmlFor="cp-year">Year</label>
                            <div className="auth-select-wrap">
                                <select
                                    id="cp-year"
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

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? 'Saving profile…' : 'Complete Setup →'}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default CompleteProfile;
