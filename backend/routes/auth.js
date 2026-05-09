import express from 'express';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import { syncUser, getUserProfile, updateUserProfile, searchUsers } from '../controllers/auth.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Clerk-verified sync (ClerkExpressWithAuth populates req.auth, doesn't block if missing)
router.post('/sync', ClerkExpressWithAuth(), syncUser);

// Protected profile routes (protect middleware blocks if not authed)
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.get('/users/search', protect, searchUsers);

export default router;
