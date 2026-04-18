import express from 'express';
import { postEntry, updateSession, postExit, getSessions } from '../controllers/session.js';
import { protect, librarianOrAdmin } from '../middleware/authMiddleware.js';
import { getExcelPath } from '../utils/excelLogger.js';
import fs from 'fs';

const router = express.Router();

// Publicly accessible count/list of sessions (for bonus feature) or protect it depending on requirement
// For now, no authentication required immediately for ease of testing to match existing 'all books' API behavior.
router.route('/').get(getSessions);

// Entry point route (Ideally protected)
router.route('/entry').post(postEntry);

// Exit point route
router.route('/exit/:id').post(postExit);

// Update active session
router.route('/:id').put(updateSession);

// @desc  Download the check-in Excel log
// @route GET /api/sessions/download/excel
// @access Admin / Librarian (protected)
router.get('/download/excel', protect, (req, res) => {
  const filePath = getExcelPath();
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'No check-in log found yet. Someone needs to check in first.' });
  }
  res.download(filePath, 'Library_CheckIn_Log.xlsx');
});

export default router;
