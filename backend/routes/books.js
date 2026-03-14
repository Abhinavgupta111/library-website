import express from 'express';
import { getBooks, getBookById, addBook, issueBook, returnBook } from '../controllers/book.js';
import { protect, librarianOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getBooks).post(protect, librarianOrAdmin, addBook);
router.route('/:id').get(getBookById);
router.route('/:id/issue').post(protect, librarianOrAdmin, issueBook);
router.route('/:id/return').post(protect, librarianOrAdmin, returnBook);

export default router;
