import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import './Admin.css';

const ENDPOINT = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Admin = () => {
    const { userInfo } = useAuth();
    const [activeTab, setActiveTab] = useState('books');
    const [reportedMessages, setReportedMessages] = useState([]);

    // ── Book Form ──
    const [bookForm, setBookForm] = useState({
        title: '', author: '', category: '', isbn: '',
        total_copies: 1, available_copies: 1,
        shelf_block: 'A', shelf_rack: '1', shelf_floor: '1',
        publisher: '', publishedYear: '', pages: '',
    });
    const [bookMsg, setBookMsg] = useState(null);
    const [bookLoading, setBookLoading] = useState(false);

    // ── Sessions ──
    const [sessions, setSessions] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);
    const [sessionFilter, setSessionFilter] = useState('');
    const [liveFlash, setLiveFlash] = useState(false); // flashes on update
    const socketRef = useRef(null);
    const sessionFilterRef = useRef(sessionFilter);

    // ── Groups ──
    const [groupName, setGroupName] = useState('');
    const [groupType, setGroupType] = useState('Official');

    const authConfig = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

    // Access guard
    if (!userInfo || (userInfo.role !== 'Admin' && userInfo.role !== 'Librarian')) {
        return (
            <div className="admin-access-denied">
                <div className="denied-icon">🔒</div>
                <h2>Access Denied</h2>
                <p>This area is restricted to Admins and Librarians only.</p>
            </div>
        );
    }

    const fetchSessions = useCallback(async (status = '') => {
        setSessionsLoading(true);
        try {
            const url = status
                ? `${ENDPOINT}/api/sessions?status=${status}`
                : `${ENDPOINT}/api/sessions`;
            const { data } = await axios.get(url);
            setSessions(data.sessions || []);
        } catch (err) {
            console.error('Error fetching sessions', err);
        } finally {
            setSessionsLoading(false);
        }
    }, []);

    const fetchReports = useCallback(async () => {
        if (userInfo?.role !== 'Admin') return;
        try {
            const { data } = await axios.get(`${ENDPOINT}/api/chat/messages/reported`, authConfig);
            setReportedMessages(data);
        } catch (err) {
            console.error('Error fetching reported messages', err);
        }
    }, [userInfo]);

    useEffect(() => { sessionFilterRef.current = sessionFilter; }, [sessionFilter]);

    useEffect(() => {
        if (activeTab === 'sessions') fetchSessions(sessionFilter);
        if (activeTab === 'reports') fetchReports();
    }, [activeTab, sessionFilter]);

    // ── Live Socket listener for session updates ──
    useEffect(() => {
        if (!userInfo) return;
        socketRef.current = io(ENDPOINT);
        socketRef.current.emit('setup', userInfo);

        socketRef.current.on('session_update', () => {
            // Flash the live indicator
            setLiveFlash(true);
            setTimeout(() => setLiveFlash(false), 1500);
            // Silently refresh session list with current filter
            const url = sessionFilterRef.current
                ? `${ENDPOINT}/api/sessions?status=${sessionFilterRef.current}`
                : `${ENDPOINT}/api/sessions`;
            axios.get(url).then(({ data }) => setSessions(data.sessions || [])).catch(() => {});
        });

        return () => { if (socketRef.current) socketRef.current.disconnect(); };
    }, [userInfo]);

    const handleBookInput = (e) => {
        const { name, value } = e.target;
        setBookForm(f => ({ ...f, [name]: value }));
    };

    const handleAddBook = async (e) => {
        e.preventDefault();
        setBookLoading(true);
        setBookMsg(null);
        try {
            const payload = {
                title: bookForm.title,
                author: bookForm.author,
                category: bookForm.category,
                isbn: bookForm.isbn,
                total_copies: Number(bookForm.total_copies),
                available_copies: Number(bookForm.available_copies),
                shelf_location: {
                    block: bookForm.shelf_block,
                    rack: bookForm.shelf_rack,
                    floor: bookForm.shelf_floor,
                },
                ...(bookForm.publisher && { publisher: bookForm.publisher }),
                ...(bookForm.publishedYear && { publishedYear: Number(bookForm.publishedYear) }),
                ...(bookForm.pages && { pages: Number(bookForm.pages) }),
            };
            await axios.post(`${ENDPOINT}/api/books`, payload, authConfig);
            setBookMsg({ type: 'success', text: `✅ "${bookForm.title}" added to the library.` });
            setBookForm({ title: '', author: '', category: '', isbn: '', total_copies: 1, available_copies: 1, shelf_block: 'A', shelf_rack: '1', shelf_floor: '1', publisher: '', publishedYear: '', pages: '' });
        } catch (error) {
            setBookMsg({ type: 'error', text: `❌ ${error.response?.data?.message || error.message}` });
        } finally {
            setBookLoading(false);
        }
    };

    const handleAddGroup = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${ENDPOINT}/api/chat/groups`, {
                group_name: groupName,
                group_type: groupType,
                description: 'Official Campus Group',
                is_official: true,
            }, authConfig);
            alert('Group added successfully');
            setGroupName('');
        } catch (error) {
            alert(`Error: ${error.response?.data?.message || error.message}`);
        }
    };

    const tabs = [
        { key: 'books', label: '📚 Add Book' },
        { key: 'sessions', label: '🏫 Library Sessions' },
        ...(userInfo.role === 'Admin' ? [
            { key: 'groups', label: '💬 Manage Groups' },
            { key: 'reports', label: '🚩 Reported Messages' },
        ] : []),
    ];

    return (
        <div className="admin-container p-4">
            <div className="admin-page-header">
                <h2>Admin Dashboard</h2>
                <span className="admin-role-badge">{userInfo.role}</span>
            </div>

            {/* ── Tabs ── */}
            <div className="admin-tabs">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        className={`tab-btn ${activeTab === t.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="admin-content">

                {/* ── ADD BOOK ── */}
                {activeTab === 'books' && (
                    <div className="admin-card-wide">
                        <h3 className="section-title">Add New Book to Collection</h3>
                        {bookMsg && (
                            <div className={`admin-msg ${bookMsg.type === 'success' ? 'msg-success' : 'msg-error'}`}>
                                {bookMsg.text}
                            </div>
                        )}
                        <form onSubmit={handleAddBook} className="admin-form-grid">
                            <div className="form-group full-width">
                                <label>Book Title *</label>
                                <input name="title" type="text" placeholder="e.g. Introduction to Algorithms" className="form-control glass-input" value={bookForm.title} onChange={handleBookInput} required />
                            </div>
                            <div className="form-group">
                                <label>Author *</label>
                                <input name="author" type="text" placeholder="e.g. Thomas H. Cormen" className="form-control glass-input" value={bookForm.author} onChange={handleBookInput} required />
                            </div>
                            <div className="form-group">
                                <label>Category *</label>
                                <input name="category" type="text" placeholder="e.g. Computer Science" className="form-control glass-input" value={bookForm.category} onChange={handleBookInput} required />
                            </div>
                            <div className="form-group">
                                <label>ISBN</label>
                                <input name="isbn" type="text" placeholder="e.g. 978-0-262-03384-8" className="form-control glass-input" value={bookForm.isbn} onChange={handleBookInput} />
                            </div>
                            <div className="form-group">
                                <label>Publisher</label>
                                <input name="publisher" type="text" placeholder="e.g. MIT Press" className="form-control glass-input" value={bookForm.publisher} onChange={handleBookInput} />
                            </div>
                            <div className="form-group">
                                <label>Published Year</label>
                                <input name="publishedYear" type="number" placeholder="e.g. 2022" className="form-control glass-input" value={bookForm.publishedYear} onChange={handleBookInput} />
                            </div>
                            <div className="form-group">
                                <label>Pages</label>
                                <input name="pages" type="number" placeholder="e.g. 512" className="form-control glass-input" value={bookForm.pages} onChange={handleBookInput} />
                            </div>
                            <div className="form-group">
                                <label>Total Copies *</label>
                                <input name="total_copies" type="number" min="1" className="form-control glass-input" value={bookForm.total_copies} onChange={handleBookInput} required />
                            </div>
                            <div className="form-group">
                                <label>Available Copies *</label>
                                <input name="available_copies" type="number" min="0" className="form-control glass-input" value={bookForm.available_copies} onChange={handleBookInput} required />
                            </div>
                            <div className="form-group shelf-group">
                                <label>Shelf Location (Block – Rack – Floor) *</label>
                                <div className="shelf-inputs">
                                    <input name="shelf_block" type="text" placeholder="Block (A)" className="form-control glass-input" value={bookForm.shelf_block} onChange={handleBookInput} required />
                                    <input name="shelf_rack" type="text" placeholder="Rack (1)" className="form-control glass-input" value={bookForm.shelf_rack} onChange={handleBookInput} required />
                                    <input name="shelf_floor" type="text" placeholder="Floor (1)" className="form-control glass-input" value={bookForm.shelf_floor} onChange={handleBookInput} required />
                                </div>
                            </div>
                            <div className="form-group full-width">
                                <button type="submit" className="btn btn-primary" disabled={bookLoading}>
                                    {bookLoading ? 'Adding…' : '+ Add to Library'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── SESSIONS ── */}
                {activeTab === 'sessions' && (
                    <div className="admin-card-wide">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <h3 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                Library Attendance Log
                                <span className={`live-badge ${liveFlash ? 'live-badge-flash' : ''}`}>⬤ LIVE</span>
                            </h3>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <select
                                    className="form-control glass-input"
                                    style={{ width: 'auto', minWidth: '160px' }}
                                    value={sessionFilter}
                                    onChange={e => setSessionFilter(e.target.value)}
                                >
                                    <option value="">All Sessions</option>
                                    <option value="IN">Currently IN</option>
                                    <option value="OUT">Checked OUT</option>
                                </select>
                                <button className="btn btn-sm btn-outline" onClick={() => fetchSessions(sessionFilter)}>
                                    ↻ Refresh
                                </button>
                                <a
                                    href={`${ENDPOINT}/api/sessions/download/excel`}
                                    download="Library_CheckIn_Log.xlsx"
                                    className="btn btn-sm btn-primary"
                                    style={{ textDecoration: 'none' }}
                                    onClick={e => {
                                        // Attach auth header by fetching with axios
                                        e.preventDefault();
                                        axios.get(`${ENDPOINT}/api/sessions/download/excel`, {
                                            ...authConfig,
                                            responseType: 'blob'
                                        }).then(res => {
                                            const url = window.URL.createObjectURL(new Blob([res.data]));
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = 'Library_CheckIn_Log.xlsx';
                                            a.click();
                                            window.URL.revokeObjectURL(url);
                                        }).catch(() => alert('No check-in log found yet.'));
                                    }}
                                >
                                    ⬇ Download Excel
                                </a>
                            </div>
                        </div>

                        {sessionsLoading ? (
                            <p style={{ color: '#94a3b8', padding: '1rem 0' }}>Loading sessions…</p>
                        ) : sessions.length === 0 ? (
                            <div className="sessions-empty">
                                <span style={{ fontSize: '2.5rem' }}>🏫</span>
                                <p>No sessions recorded yet.</p>
                            </div>
                        ) : (
                            <div className="sessions-table-wrap">
                                <table className="sessions-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Purpose</th>
                                            <th>Books Read</th>
                                            <th>Entry</th>
                                            <th>Exit</th>
                                            <th>Duration</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                                {sessions.map(s => {
                                            const entry = new Date(s.entryTime);
                                            const exit = s.exitTime ? new Date(s.exitTime) : null;
                                            const diffMs = exit ? exit - entry : Date.now() - entry;
                                            const diffMins = Math.floor(diffMs / 60000);
                                            const dur = diffMins < 60 ? `${diffMins}m` : `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
                                            return (
                                                <tr key={s._id} className={s.autoCheckout ? 'tr-auto-checkout' : ''}>
                                                    <td className="td-name">{s.name}</td>
                                                    <td className="td-purpose">{s.purpose || '—'}</td>
                                                    <td className="td-books">
                                                        {s.booksRead && s.booksRead.length > 0
                                                            ? s.booksRead.map(b => b.title).join(', ')
                                                            : '—'}
                                                    </td>
                                                    <td className="td-time">{entry.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                                                    <td className="td-time">{exit ? exit.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}</td>
                                                    <td className="td-dur">{dur}</td>
                                                    <td>
                                                        <span className={`session-badge ${s.status === 'IN' ? 'badge-in' : 'badge-out'}`}>
                                                            {s.status === 'IN' ? '🟢 IN' : '🔴 OUT'}
                                                        </span>
                                                        {s.autoCheckout && (
                                                            <span className="badge-auto" title="Automatically checked out after 12 hours">
                                                                ⚙️ Auto
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ── GROUPS ── */}
                {activeTab === 'groups' && userInfo.role === 'Admin' && (
                    <div className="admin-card-narrow">
                        <h3 className="section-title">Create Official Group</h3>
                        <form onSubmit={handleAddGroup} className="admin-form">
                            <div className="form-group">
                                <label>Group Name *</label>
                                <input type="text" placeholder="e.g. IT Department 2025" className="form-control glass-input" value={groupName} onChange={e => setGroupName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Group Type</label>
                                <select className="form-control glass-input" value={groupType} onChange={e => setGroupType(e.target.value)}>
                                    <option value="Official">Official College Group</option>
                                    <option value="Society">Society Group</option>
                                    <option value="Event">Event Group</option>
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary">Create Group</button>
                        </form>
                    </div>
                )}

                {/* ── REPORTS ── */}
                {activeTab === 'reports' && userInfo.role === 'Admin' && (
                    <div className="admin-card-wide">
                        <h3 className="section-title">Reported Messages</h3>
                        {reportedMessages.length === 0 ? (
                            <div className="sessions-empty">
                                <span style={{ fontSize: '2.5rem' }}>✅</span>
                                <p>No reported messages at this time.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {reportedMessages.map(msg => (
                                    <div key={msg._id} className="report-item">
                                        <div className="report-header">
                                            <strong>{msg.sender_id?.name || 'Unknown User'}</strong>
                                            <span className="report-group">{msg.group_id?.group_name || 'Unknown Group'}</span>
                                        </div>
                                        <p className="report-msg">{msg.message}</p>
                                        {msg.fileUrl && (
                                            <a href={`${ENDPOINT}${msg.fileUrl}`} target="_blank" rel="noopener noreferrer" className="report-file">
                                                📎 Attached File
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
