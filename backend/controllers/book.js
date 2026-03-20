import Book from '../models/Book.js';
import IssueRequest from '../models/IssueRequest.js';

// @desc    Get all books
// @route   GET /api/books
// @access  Public
export const getBooks = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          $or: [
            { title: { $regex: req.query.keyword, $options: 'i' } },
            { author: { $regex: req.query.keyword, $options: 'i' } },
            { category: { $regex: req.query.keyword, $options: 'i' } }
          ],
        }
      : {};

    const books = await Book.find({ ...keyword });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get book by ID
// @route   GET /api/books/:id
// @access  Public
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a book
// @route   POST /api/books
// @access  Private/Admin|Librarian
export const addBook = async (req, res) => {
  try {
    const { title, author, category, isbn, total_copies, available_copies, shelf_location } = req.body;
    const book = new Book({ title, author, category, isbn, total_copies, available_copies, shelf_location });
    const createdBook = await book.save();
    res.status(201).json(createdBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request to issue a book (student self-service)
// @route   POST /api/books/:id/request
// @access  Private
export const requestIssue = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Check if user already has a pending request or active borrow for this book
    const existing = await IssueRequest.findOne({
      user: req.user._id,
      book: req.params.id,
      status: 'Pending'
    });
    if (existing) return res.status(400).json({ message: 'You already have a pending request for this book' });

    const alreadyBorrowed = book.issued_to.find(
      (issue) => issue.user.toString() === req.user._id.toString() && !issue.return_date
    );
    if (alreadyBorrowed) return res.status(400).json({ message: 'You already have this book issued' });

    const request = await IssueRequest.create({
      user: req.user._id,
      book: req.params.id,
    });

    const populated = await IssueRequest.findById(request._id).populate('book', 'title author category');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel a pending request
// @route   DELETE /api/books/requests/:requestId
// @access  Private
export const cancelRequest = async (req, res) => {
  try {
    const request = await IssueRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    if (request.status !== 'Pending') return res.status(400).json({ message: 'Cannot cancel a processed request' });

    await request.deleteOne();
    res.json({ message: 'Request cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get MY issue requests
// @route   GET /api/books/my-requests
// @access  Private
export const getMyRequests = async (req, res) => {
  try {
    const requests = await IssueRequest.find({ user: req.user._id })
      .populate('book', 'title author category isbn shelf_location available_copies total_copies')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get MY currently borrowed books
// @route   GET /api/books/my-borrowed
// @access  Private
export const getMyBorrowed = async (req, res) => {
  try {
    // Find books where issued_to has this user without a return_date
    const books = await Book.find({
      'issued_to': {
        $elemMatch: {
          user: req.user._id,
          return_date: { $exists: false }
        }
      }
    });

    // Attach the specific issue record for due date info
    const result = books.map(book => {
      const issueRecord = book.issued_to.find(
        (issue) => issue.user.toString() === req.user._id.toString() && !issue.return_date
      );
      return {
        _id: book._id,
        title: book.title,
        author: book.author,
        category: book.category,
        isbn: book.isbn,
        shelf_location: book.shelf_location,
        issue_date: issueRecord?.issue_date,
        due_date: issueRecord ? new Date(new Date(issueRecord.issue_date).setDate(new Date(issueRecord.issue_date).getDate() + 14)) : null,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Issue a book (librarian/admin manually)
// @route   POST /api/books/:id/issue
// @access  Private/Librarian
export const issueBook = async (req, res) => {
  try {
    const { userId } = req.body;
    const book = await Book.findById(req.params.id);

    if (book) {
      if (book.available_copies > 0) {
        book.available_copies -= 1;
        book.issued_to.push({ user: userId });
        await book.save();
        res.json({ message: 'Book issued successfully', book });
      } else {
        res.status(400).json({ message: 'No copies available' });
      }
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Return a book
// @route   POST /api/books/:id/return
// @access  Private/Librarian
export const returnBook = async (req, res) => {
  try {
    const { userId } = req.body;
    const book = await Book.findById(req.params.id);

    if (book) {
      const issueRecord = book.issued_to.find(
        (issue) => issue.user.toString() === userId && !issue.return_date
      );

      if (issueRecord) {
        issueRecord.return_date = Date.now();
        book.available_copies += 1;
        await book.save();
        res.json({ message: 'Book returned successfully', book });
      } else {
        res.status(400).json({ message: 'Book not issued to this user or already returned' });
      }
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
