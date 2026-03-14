import Book from '../models/Book.js';

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

    const book = new Book({
      title,
      author,
      category,
      isbn,
      total_copies,
      available_copies,
      shelf_location
    });

    const createdBook = await book.save();
    res.status(201).json(createdBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Issue a book
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
