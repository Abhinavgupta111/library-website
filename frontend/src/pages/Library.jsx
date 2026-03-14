import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../components/Card';
import './Library.css';

const Library = () => {
    const [books, setBooks] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/books?keyword=${keyword}`);
                setBooks(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching books', error);
                setLoading(false);
            }
        };
        fetchBooks();
    }, [keyword]);

    return (
        <div className="library-container">
            <div className="library-header">
                <h2>Digital Library</h2>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search books by title, author, or category..."
                        className="form-control glass-input search-input"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>
            </div>

            <div className="books-grid">
                {loading ? (
                    <p>Loading catalog...</p>
                ) : books.length > 0 ? (
                    books.map(book => (
                        <Card
                            key={book._id}
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
                                    {book.title}
                                </div>
                            }
                            subtitle={`By ${book.author}`}
                            className="book-card"
                        >
                            <div className="book-details">
                                <span className="badge category-badge">{book.category}</span>
                                <p><strong>ISBN:</strong> {book.isbn}</p>
                                <div className="availability">
                                    <span className={`status ${book.available_copies > 0 ? 'status-available' : 'status-unavailable'}`}>
                                    </span>
                                    {book.available_copies} of {book.total_copies} available
                                </div>
                                <div className="shelf-location">
                                    <strong>Location:</strong> Block {book.shelf_location.block}, Rack {book.shelf_location.rack}, Floor {book.shelf_location.floor}
                                </div>
                            </div>
                            <button className="btn btn-primary block-btn mt-3" disabled={book.available_copies === 0}>
                                {book.available_copies > 0 ? 'Request Issue' : 'Unavailable'}
                            </button>
                        </Card>
                    ))
                ) : (
                    <p>No books found matching your criteria.</p>
                )}
            </div>
        </div>
    );
};

export default Library;
