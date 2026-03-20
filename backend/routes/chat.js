import express from 'express';
import { createGroup, getGroups, joinGroup, getGroupMessages, reportMessage, getReportedMessages } from '../controllers/chat.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/groups').post(protect, createGroup).get(protect, getGroups);
router.route('/groups/:id/join').post(protect, joinGroup);
router.route('/groups/:id/messages').get(protect, getGroupMessages);
router.route('/messages/reported').get(protect, getReportedMessages);
router.route('/messages/:id/report').put(protect, reportMessage);

export default router;
