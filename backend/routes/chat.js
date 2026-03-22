import express from 'express';
import { 
  createGroup, getGroups, joinGroup, getGroupMessages, 
  reportMessage, getReportedMessages,
  getConversations, createOrGetDirectConversation, getConversationMessages, pinConversation, markConversationRead, joinConversation
} from '../controllers/chat.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Conversation endpoints
router.route('/conversations').get(protect, getConversations);
router.route('/conversations/direct/:userId').post(protect, createOrGetDirectConversation);
router.route('/conversations/:id/messages').get(protect, getConversationMessages);
router.route('/conversations/:id/pin').post(protect, pinConversation);
router.route('/conversations/:id/read').put(protect, markConversationRead);
router.route('/conversations/:id/join').put(protect, joinConversation);

// Legacy Group & Message endpoints
router.route('/groups').post(protect, createGroup).get(protect, getGroups);
router.route('/groups/:id/join').post(protect, joinGroup);
router.route('/groups/:id/messages').get(protect, getGroupMessages);
router.route('/messages/reported').get(protect, getReportedMessages);
router.route('/messages/:id/report').put(protect, reportMessage);

export default router;
