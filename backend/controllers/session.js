import Session from '../models/Session.js';
import { logCheckIn, logCheckOut } from '../utils/excelLogger.js';
import { getIO } from '../utils/socket.js';
import { sheetsLogCheckIn, sheetsLogCheckOut } from '../utils/sheetsLogger.js';

// @desc    Register a student entry into the library
// @route   POST /api/sessions/entry
// @access  Private
export const postEntry = async (req, res) => {
  try {
    const { studentId, name, purpose } = req.body;
    
    // Fallback logic to protect from missing details if authenticated
    const targetStudentId = studentId || req.user?._id;
    const targetName = name || req.user?.name;

    if (!targetStudentId || !targetName) {
      return res.status(400).json({ message: 'studentId and name are required' });
    }

    // Validation: A student cannot enter again if already IN
    const activeSession = await Session.findOne({ studentId: targetStudentId, status: 'IN' });
    if (activeSession) {
      return res.status(400).json({ message: 'Student is already inside the library', session: activeSession });
    }

    const session = await Session.create({
      studentId: targetStudentId,
      name: targetName,
      purpose: purpose || 'General Study',
      status: 'IN'
    });

    // Log to Excel
    logCheckIn(session);

    // Log to Google Sheets (fire-and-forget)
    sheetsLogCheckIn(session);

    // Notify all admin clients in real-time
    const io = getIO();
    if (io) io.emit('session_update', { action: 'checkin', session });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an active session (purpose or booksRead)
// @route   PUT /api/sessions/:id
// @access  Private
export const updateSession = async (req, res) => {
  try {
    const { purpose, booksRead } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.status === 'OUT') {
      return res.status(400).json({ message: 'Cannot update a closed session' });
    }

    if (purpose) session.purpose = purpose;
    
    // Example format for booksRead is [bookId1, bookId2]
    if (booksRead && Array.isArray(booksRead)) {
      // Append unique books
      const existingBooks = session.booksRead.map(id => id.toString());
      booksRead.forEach(bookId => {
        if (!existingBooks.includes(bookId.toString())) {
          session.booksRead.push(bookId);
        }
      });
    }

    const updatedSession = await session.save();
    
    // Optionally populate populated data
    const populated = await Session.findById(updatedSession._id).populate('booksRead', 'title author');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark exit time for a student session
// @route   POST /api/sessions/exit/:id
// @access  Private
export const postExit = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.status === 'OUT') {
      return res.status(400).json({ message: 'Session is already marked as OUT' });
    }

    session.exitTime = Date.now();
    session.status = 'OUT';
    
    const updatedSession = await session.save();
    // Log check-out to Excel
    logCheckOut(updatedSession);

    // Log check-out to Google Sheets (fire-and-forget)
    sheetsLogCheckOut(updatedSession);

    // Notify all admin clients in real-time
    const io = getIO();
    if (io) io.emit('session_update', { action: 'checkout', session: updatedSession });

    res.json({ message: 'Exit recorded successfully', session: updatedSession });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all sessions or currently active students
// @route   GET /api/sessions
// @access  Public/Private
export const getSessions = async (req, res) => {
  try {
    const query = {};
    if (req.query.status) {
      query.status = req.query.status.toUpperCase();
    }
    
    if (req.query.studentId) {
      query.studentId = req.query.studentId;
    }

    const sessions = await Session.find(query)
      .populate('booksRead', 'title author')
      .sort({ entryTime: -1 });
      
    res.json({
      activeCount: query.status === 'IN' ? sessions.length : sessions.filter(s => s.status === 'IN').length,
      totalRecords: sessions.length,
      sessions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
