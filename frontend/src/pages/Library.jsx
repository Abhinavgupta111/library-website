import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Library.css';

const ENDPOINT = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const PAGE_SIZE = 20;

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

const categoryColor = (cat) => CATEGORY_COLORS[cat] || '#6366f1';

const SkeletonCard = () => (
  <div className="book-card skeleton-card">
    <div className="skeleton skeleton-title" />
    <div className="skeleton skeleton-sub" />
    <div className="skeleton skeleton-badge" />
    <div className="skeleton skeleton-line" />
    <div className="skeleton skeleton-line short" />
  </div>
);

const Library = () => {
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState('');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // Debounce keyword input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedKeyword(keyword);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [keyword]);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: PAGE_SIZE,
      });
      if (debouncedKeyword) params.set('keyword', debouncedKeyword);
      if (category) params.set('category', category);
      if (availableOnly) params.set('available', 'true');
      if (sort) params.set('sort', sort);

      const { data } = await axios.get(`${ENDPOINT}/api/books?${params.toString()}`);
      // Backend returns { books, page, pages, total } when pagination params given
      if (data.books) {
        setBooks(data.books);
        setTotal(data.total);
        setPages(data.pages);
      } else {
        // Fallback for plain array response
        setBooks(data);
        setTotal(data.length);
        setPages(1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedKeyword, category, availableOnly, sort]);

  // Fetch all category names once for the dropdown
  useEffect(() => {
    axios.get(`${ENDPOINT}/api/books?limit=1000`).then(({ data }) => {
      const allBooks = data.books || data;
      const cats = [...new Set(allBooks.map(b => b.category).filter(Boolean))].sort();
      setCategories(cats);
    }).catch(() => {});
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  // Reset page when filters change
  const handleFilter = (setter) => (val) => {
    setter(val);
    setPage(1);
  };

  return (
    <div className="library-container">
      {/* ── Header ── */}
      <div className="library-header">
        <div>
          <h2 className="library-title">📚 IT Department Library</h2>
          <p className="library-subtitle">
            {loading ? 'Loading...' : `${total.toLocaleString()} book${total !== 1 ? 's' : ''} in collection`}
          </p>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="filter-bar">
        <div className="search-wrap">
          <svg className="search-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="lib-search"
            type="text"
            placeholder="Search by title, author, or category…"
            className="form-control glass-input search-input"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
          {keyword && (
            <button className="clear-btn" onClick={() => setKeyword('')} title="Clear search">✕</button>
          )}
        </div>

        <select
          id="lib-category"
          className="form-control glass-input filter-select"
          value={category}
          onChange={e => handleFilter(setCategory)(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          id="lib-sort"
          className="form-control glass-input filter-select"
          value={sort}
          onChange={e => handleFilter(setSort)(e.target.value)}
        >
          <option value="">Sort: Newest Published</option>
          <option value="title">Title A → Z</option>
          <option value="-title">Title Z → A</option>
          <option value="year">Sort: Oldest Published</option>
        </select>

        <label className="availability-toggle" htmlFor="lib-avail">
          <input
            id="lib-avail"
            type="checkbox"
            checked={availableOnly}
            onChange={e => handleFilter(setAvailableOnly)(e.target.checked)}
          />
          <span className="toggle-track">
            <span className="toggle-thumb" />
          </span>
          <span className="toggle-label">Available only</span>
        </label>
      </div>

      {/* ── Results info ── */}
      {!loading && (
        <div className="results-info">
          {total === 0
            ? 'No books match your filters.'
            : `Showing ${((page - 1) * PAGE_SIZE) + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total.toLocaleString()} books`}
          {(keyword || category || availableOnly) && (
            <button className="clear-filters-btn" onClick={() => { setKeyword(''); setCategory(''); setAvailableOnly(false); setSort(''); setPage(1); }}>
              ✕ Clear all filters
            </button>
          )}
        </div>
      )}

      {/* ── Book Grid ── */}
      {loading ? (
        <div className="books-grid">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          {books.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No books found</h3>
              <p>Try a different search term or remove some filters.</p>
              <button className="btn btn-primary" onClick={() => { setKeyword(''); setCategory(''); setAvailableOnly(false); setPage(1); }}>
                Show All Books
              </button>
            </div>
          ) : (
            <div className="books-grid">
              {books.map(book => {
                const color = categoryColor(book.category);
                const avail = book.available_copies > 0;
                return (
                  <div className="book-card" key={book._id}>
                    {/* Color accent strip */}
                    <div className="book-accent" style={{ background: color }} />
                    <div className="book-card-body">
                      <h4 className="book-title" title={book.title}>{book.title}</h4>
                      <p className="book-author">by {book.author}</p>

                      <span
                        className="badge category-badge"
                        style={{ background: color + '22', color, border: `1px solid ${color}44` }}
                      >
                        {book.category}
                      </span>

                      <div className="book-meta">
                        {book.isbn && !book.isbn.startsWith('SPECIMEN') && (
                          <span className="meta-item">
                            <span className="meta-label">ISBN</span>
                            <span className="meta-value">{book.isbn}</span>
                          </span>
                        )}
                        {book.publisher && (
                          <span className="meta-item">
                            <span className="meta-label">Publisher</span>
                            <span className="meta-value">{book.publisher}</span>
                          </span>
                        )}
                        {book.publishedYear > 0 && (
                          <span className="meta-item">
                            <span className="meta-label">Year</span>
                            <span className="meta-value">{book.publishedYear}</span>
                          </span>
                        )}
                        {book.pages > 0 && (
                          <span className="meta-item">
                            <span className="meta-label">Pages</span>
                            <span className="meta-value">{book.pages} pages</span>
                          </span>
                        )}
                        {book.shelf_location?.block && (
                          <span className="meta-item">
                            <span className="meta-label">Shelf</span>
                            <span className="meta-value shelf-tag">
                              {book.shelf_location.block}-{book.shelf_location.rack}-{book.shelf_location.floor}
                            </span>
                          </span>
                        )}
                      </div>

                      <div className="availability-row">
                        <span className={`avail-dot ${avail ? 'dot-green' : 'dot-red'}`} />
                        <span className={avail ? 'avail-text-green' : 'avail-text-red'}>
                          {book.available_copies} / {book.total_copies} available
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Pagination ── */}
          {pages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Prev
              </button>

              <div className="page-numbers">
                {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                  // Show smart page numbers
                  let p;
                  if (pages <= 7) {
                    p = i + 1;
                  } else if (page <= 4) {
                    p = i + 1 <= 5 ? i + 1 : (i === 5 ? '…' : pages);
                  } else if (page >= pages - 3) {
                    p = i === 0 ? 1 : (i === 1 ? '…' : pages - 6 + i + 1);
                  } else {
                    const map = [1, '…', page - 1, page, page + 1, '…', pages];
                    p = map[i];
                  }
                  return (
                    <button
                      key={i}
                      className={`page-num ${p === page ? 'page-active' : ''} ${p === '…' ? 'page-ellipsis' : ''}`}
                      onClick={() => p !== '…' && setPage(p)}
                      disabled={p === '…'}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                className="page-btn"
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Library;
