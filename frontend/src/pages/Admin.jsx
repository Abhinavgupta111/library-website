import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import './Admin.css';

const ENDPOINT = 'http://localhost:5000';

const Admin = () => {
    const { userInfo } = useAuth();
    const [activeTab, setActiveTab] = useState('books');

    // States for forms
    const [bookTitle, setBookTitle] = useState('');
    const [bookAuthor, setBookAuthor] = useState('');
    const [bookCategory, setBookCategory] = useState('');
    const [bookIsbn, setBookIsbn] = useState('');

    const [groupName, setGroupName] = useState('');
    const [groupType, setGroupType] = useState('Official');

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
            </div>
        </div>
    );
};

export default Admin;
