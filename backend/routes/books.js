import express from 'express';
import { getBooks, getBookById, addBook, issueBook, returnBook, requestIssue, cancelRequest, getMyRequests, getMyBorrowed, updateBook, deleteBook } from '../controllers/book.js';
import { protect, librarianOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getBooks).post(protect, librarianOrAdmin, addBook);
router.route('/my-requests').get(protect, getMyRequests);
router.route('/my-borrowed').get(protect, getMyBorrowed);
router.route('/requests/:requestId').delete(protect, cancelRequest);
router.route('/:id').get(getBookById).put(protect, librarianOrAdmin, updateBook).delete(protect, librarianOrAdmin, deleteBook);
router.route('/:id/issue').post(protect, librarianOrAdmin, issueBook);
router.route('/:id/return').post(protect, librarianOrAdmin, returnBook);
router.route('/:id/request').post(protect, requestIssue);

export default router;
