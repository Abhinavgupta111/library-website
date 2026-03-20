import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import './Library.css';

const ENDPOINT = 'http://localhost:5000';

const CATEGORY_COLORS = {
  'Programming': '#6366f1',
  'Computer Science': '#8b5cf6',
  'AI / ML': '#06b6d4',
  'Networking': '#10b981',
  'Systems': '#f59e0b',
  'Databases': '#ef4444',
  'Cloud': '#3b82f6',
  'Cybersecurity': '#f43f5e',
  'Web Development': '#14b8a6',
  'Mathematics': '#a855f7',
  'Emerging Tech': '#ec4899',
  'Software Engineering': '#84cc16',
  'Computer Architecture': '#fb923c',
};

const Library = () => {
  const { userInfo } = useAuth();
  const [tab, setTab] = useState('all');
  const [books, setBooks] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [myBorrowed, setMyBorrowed] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(null); // bookId being acted upon

  const config = useCallback(() => ({
    headers: { Authorization: `Bearer ${userInfo?.token}` }
  }), [userInfo]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [booksRes, reqRes, borRes] = await Promise.all([
        axios.get(`${ENDPOINT}/api/books?keyword=${keyword}`),
        userInfo ? axios.get(`${ENDPOINT}/api/books/my-requests`, config()) : { data: [] },
        userInfo ? axios.get(`${ENDPOINT}/api/books/my-borrowed`, config()) : { data: [] },
      ]);
      setBooks(booksRes.data);
      setMyRequests(reqRes.data);
      setMyBorrowed(borRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [keyword, userInfo, config]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleRequest = async (bookId) => {
    if (!userInfo) return alert('Please login to request a book.');
    setLoadingAction(bookId);
    try {
      await axios.post(`${ENDPOINT}/api/books/${bookId}/request`, {}, config());
      await fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request book.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCancel = async (requestId) => {
    setLoadingAction(requestId);
    try {
      await axios.delete(`${ENDPOINT}/api/books/requests/${requestId}`, config());
      await fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request.');
    } finally {
      setLoadingAction(null);
    }
  };

  const pendingBookIds = new Set(myRequests.filter(r => r.status === 'Pending').map(r => r.book?._id));
  const borrowedBookIds = new Set(myBorrowed.map(b => b._id));

  const getBookAction = (book) => {
    if (borrowedBookIds.has(book._id)) {
      return <button className="btn block-btn mt-3" style={{ background: '#10b981', opacity: 0.9, cursor: 'default' }} disabled>✅ Currently Borrowed</button>;
    }
    if (pendingBookIds.has(book._id)) {
      return <button className="btn block-btn mt-3" style={{ background: '#f59e0b', opacity: 0.9, cursor: 'default' }} disabled>⏳ Request Pending</button>;
    }
    if (book.available_copies === 0) {
      return <button className="btn block-btn mt-3" style={{ background: '#374151', cursor: 'not-allowed' }} disabled>Unavailable</button>;
    }
    return (
      <button
        className="btn btn-primary block-btn mt-3"
        onClick={() => handleRequest(book._id)}
        disabled={loadingAction === book._id}
      >
        {loadingAction === book._id ? 'Requesting...' : 'Request Issue'}
      </button>
    );
  };

  const categoryColor = (cat) => CATEGORY_COLORS[cat] || '#6366f1';

  const tabStyle = (t) => ({
    padding: '0.5rem 1.25rem',
    borderRadius: '99px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    transition: 'all 0.2s',
    background: tab === t ? '#6366f1' : 'rgba(255,255,255,0.05)',
    color: tab === t ? '#fff' : '#94a3b8',
  });

  return (
    <div className="library-container">
      <div className="library-header">
        <h2>Digital Library</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button style={tabStyle('all')} onClick={() => setTab('all')}>📚 All Books ({books.length})</button>
          <button style={tabStyle('borrowed')} onClick={() => setTab('borrowed')}>📖 Borrowed ({myBorrowed.length})</button>
          <button style={tabStyle('requested')} onClick={() => setTab('requested')}>📋 Requested ({myRequests.length})</button>
        </div>
      </div>

      {tab === 'all' && (
        <div className="search-bar" style={{ marginBottom: '1.25rem' }}>
          <input
            type="text"
            placeholder="Search books by title, author, or category..."
            className="form-control glass-input search-input"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <p style={{ color: '#94a3b8', padding: '2rem 0' }}>Loading...</p>
      ) : (
        <>
          {/* ALL BOOKS TAB */}
          {tab === 'all' && (
            <div className="books-grid">
              {books.length > 0 ? books.map(book => (
                <Card key={book._id} title={book.title} subtitle={`By ${book.author}`} className="book-card">
                  <div className="book-details">
                    <span className="badge category-badge" style={{ background: categoryColor(book.category) + '22', color: categoryColor(book.category), border: `1px solid ${categoryColor(book.category)}44` }}>
                      {book.category}
                    </span>
                    <p><strong>ISBN:</strong> {book.isbn}</p>
                    <div className="availability">
                      <span className={`status ${book.available_copies > 0 ? 'status-available' : 'status-unavailable'}`}></span>
                      {book.available_copies} of {book.total_copies} available
                    </div>
                    <div className="shelf-location">
                      <strong>Location:</strong> Block {book.shelf_location?.block}, Rack {book.shelf_location?.rack}, Floor {book.shelf_location?.floor}
                    </div>
                  </div>
                  {getBookAction(book)}
                </Card>
              )) : <p style={{ color: '#94a3b8' }}>No books found.</p>}
            </div>
          )}

          {/* BORROWED TAB */}
          {tab === 'borrowed' && (
            <div className="books-grid">
              {myBorrowed.length > 0 ? myBorrowed.map(book => (
                <Card key={book._id} title={book.title} subtitle={`By ${book.author}`} className="book-card">
                  <div className="book-details">
                    <span className="badge category-badge" style={{ background: categoryColor(book.category) + '22', color: categoryColor(book.category) }}>
                      {book.category}
                    </span>
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                      <span>📅 Issued: {book.issue_date ? new Date(book.issue_date).toLocaleDateString('en-IN') : 'N/A'}</span>
                      <span style={{ color: book.due_date && new Date(book.due_date) < new Date() ? '#ef4444' : '#10b981' }}>
                        ⏰ Due: {book.due_date ? new Date(book.due_date).toLocaleDateString('en-IN') : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <button className="btn block-btn mt-3" style={{ background: '#10b981' }} disabled>✅ Currently Borrowed</button>
                </Card>
              )) : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📖</div>
                  <h3 style={{ color: '#f8fafc' }}>No Books Borrowed</h3>
                  <p>You haven't borrowed any books yet. Browse the library and request a book!</p>
                  <button className="btn btn-primary mt-3" onClick={() => setTab('all')}>Browse Library</button>
                </div>
              )}
            </div>
          )}

          {/* REQUESTED TAB */}
          {tab === 'requested' && (
            <div className="books-grid">
              {myRequests.length > 0 ? myRequests.map(req => (
                <Card key={req._id} title={req.book?.title || 'Unknown Book'} subtitle={`By ${req.book?.author || '—'}`} className="book-card">
                  <div className="book-details">
                    <span className="badge category-badge" style={{ background: categoryColor(req.book?.category) + '22', color: categoryColor(req.book?.category) }}>
                      {req.book?.category}
                    </span>
                    <div style={{ marginTop: '0.5rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '99px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        background: req.status === 'Pending' ? 'rgba(245,158,11,0.15)' : req.status === 'Approved' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                        color: req.status === 'Pending' ? '#f59e0b' : req.status === 'Approved' ? '#10b981' : '#ef4444',
                      }}>
                        {req.status === 'Pending' ? '⏳' : req.status === 'Approved' ? '✅' : '❌'} {req.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                      Requested: {new Date(req.requested_date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  {req.status === 'Pending' && (
                    <button
                      className="btn block-btn mt-3"
                      style={{ background: '#ef4444' }}
                      onClick={() => handleCancel(req._id)}
                      disabled={loadingAction === req._id}
                    >
                      {loadingAction === req._id ? 'Cancelling...' : 'Cancel Request'}
                    </button>
                  )}
                </Card>
              )) : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                  <h3 style={{ color: '#f8fafc' }}>No Requests Yet</h3>
                  <p>Request a book from the library to see it here.</p>
                  <button className="btn btn-primary mt-3" onClick={() => setTab('all')}>Browse Library</button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Library;
