import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import './Admin.css';

const ENDPOINT = 'http://localhost:5000';

const Admin = () => {
    const { userInfo } = useAuth();
    const [activeTab, setActiveTab] = useState('books');
    const [reportedMessages, setReportedMessages] = useState([]);

    // States for forms
    const [bookTitle, setBookTitle] = useState('');
    const [bookAuthor, setBookAuthor] = useState('');
    const [bookCategory, setBookCategory] = useState('');
    const [bookIsbn, setBookIsbn] = useState('');

    const [groupName, setGroupName] = useState('');
    const [groupType, setGroupType] = useState('Official');

    useEffect(() => {
        if (activeTab === 'reports' && userInfo?.role === 'Admin') {
            const fetchReports = async () => {
                try {
                    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                    const { data } = await axios.get(`${ENDPOINT}/api/chat/messages/reported`, config);
                    setReportedMessages(data);
                } catch (err) {
                    console.error('Error fetching reported messages', err);
                }
            };
            fetchReports();
        }
    }, [activeTab, userInfo]);

    // Verify Admin Role
    if (!userInfo || (userInfo.role !== 'Admin' && userInfo.role !== 'Librarian')) {
        return <div className="p-4 text-center"><h1>Access Denied. Admins and Librarians only.</h1></div>;
    }

    const handleAddBook = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}`, 'Content-Type': 'application/json' } };
            const newBook = {
                title: bookTitle,
                author: bookAuthor,
                category: bookCategory,
                isbn: bookIsbn,
                total_copies: 5,
                available_copies: 5,
                shelf_location: { block: 'A', rack: '1', floor: '1' }
            };
            await axios.post(`${ENDPOINT}/api/books`, newBook, config);
            alert('Book added successfully');
            setBookTitle(''); setBookAuthor(''); setBookCategory(''); setBookIsbn('');
        } catch (error) {
            alert(`Error adding book: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleAddGroup = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}`, 'Content-Type': 'application/json' } };
            await axios.post(`${ENDPOINT}/api/chat/groups`, {
                group_name: groupName,
                group_type: groupType,
                description: 'Official Campus Group',
                is_official: true
            }, config);
            alert('Group added successfully');
            setGroupName('');
        } catch (error) {
            alert(`Error adding group: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div className="admin-container p-4">
            <h2>Admin Dashboard</h2>

            <div className="admin-tabs">
                <button
                    className={`tab-btn ${activeTab === 'books' ? 'active' : ''}`}
                    onClick={() => setActiveTab('books')}
                >
                    Manage Books
                </button>
                {userInfo.role === 'Admin' && (
                    <button
                        className={`tab-btn ${activeTab === 'groups' ? 'active' : ''}`}
                        onClick={() => setActiveTab('groups')}
                    >
                        Manage Groups
                    </button>
                )}
                {userInfo.role === 'Admin' && (
                    <button
                        className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reports')}
                    >
                        Reported Messages
                    </button>
                )}
            </div>

            <div className="admin-content">
                {activeTab === 'books' && (
                    <Card title="Add New Book" className="admin-card">
                        <form onSubmit={handleAddBook} className="admin-form">
                            <input type="text" placeholder="Book Title" className="form-control glass-input" value={bookTitle} onChange={e => setBookTitle(e.target.value)} required />
                            <input type="text" placeholder="Author" className="form-control glass-input" value={bookAuthor} onChange={e => setBookAuthor(e.target.value)} required />
                            <input type="text" placeholder="Category" className="form-control glass-input" value={bookCategory} onChange={e => setBookCategory(e.target.value)} required />
                            <input type="text" placeholder="ISBN" className="form-control glass-input" value={bookIsbn} onChange={e => setBookIsbn(e.target.value)} required />
                            <button type="submit" className="btn btn-primary mt-2">Add to Library</button>
                        </form>
                    </Card>
                )}

                {activeTab === 'groups' && userInfo.role === 'Admin' && (
                    <Card title="Create Official Group" className="admin-card">
                        <form onSubmit={handleAddGroup} className="admin-form">
                            <input type="text" placeholder="Group Name" className="form-control glass-input" value={groupName} onChange={e => setGroupName(e.target.value)} required />
                            <select className="form-control glass-input" value={groupType} onChange={e => setGroupType(e.target.value)}>
                                <option value="Official">Official College Group</option>
                                <option value="Society">Society Group</option>
                                <option value="Event">Event Group</option>
                            </select>
                            <button type="submit" className="btn btn-primary mt-2">Create Group</button>
                        </form>
                    </Card>
                )}

                {activeTab === 'reports' && userInfo.role === 'Admin' && (
                    <Card title="Reported Messages" className="admin-card">
                        {reportedMessages.length === 0 ? <p className="text-gray-400">No reported messages at this time.</p> : (
                            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                {reportedMessages.map(msg => (
                                    <div key={msg._id} style={{padding: '1rem', background: '#1f2937', borderRadius: '8px', borderLeft: '4px solid #ef4444'}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                                            <strong style={{color: '#f8fafc'}}>{msg.sender_id?.name || 'Unknown User'}</strong>
                                            <span style={{color: '#9ca3af', fontSize: '0.85rem'}}>{msg.group_id?.group_name || 'Unknown Group'}</span>
                                        </div>
                                        <p style={{margin: 0, fontStyle: 'italic', color: '#e5e7eb'}}>{msg.message}</p>
                                        {msg.fileUrl && (
                                            <a href={`${ENDPOINT}${msg.fileUrl}`} target="_blank" rel="noopener noreferrer" style={{color: '#60a5fa', textDecoration: 'none', display: 'inline-block', marginTop: '0.5rem', fontSize: '0.85rem'}}>
                                                📎 Attached File
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Admin;
