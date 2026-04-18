import express from 'express';
import { registerUser, loginUser, getUserProfile, searchUsers, updateUserProfile, forgotPassword, resetPassword } from '../controllers/auth.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.get('/users/search', protect, searchUsers);

export default router;
