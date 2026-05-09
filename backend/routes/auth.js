import express from 'express';
import { syncUser, getUserProfile, updateUserProfile, searchUsers } from '../controllers/auth.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Clerk-authenticated sync (called on every login/signup from frontend)
router.post('/sync', syncUser);

// Protected profile routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.get('/users/search', protect, searchUsers);

export default router;
