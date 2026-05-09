import { clerkClient } from '@clerk/clerk-sdk-node';
import User from '../models/User.js';

/**
 * protect — Verifies the Clerk Bearer token and attaches req.user (MongoDB User).
 */
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify with Clerk — throws if invalid/expired
    const payload = await clerkClient.verifyToken(token);
    const clerkId = payload.sub;

    // Find corresponding MongoDB user
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(401).json({ message: 'User not found. Please complete sign-up.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[Auth] Token verification failed:', err.message);
    return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
};

export const librarianOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'Admin' || req.user.role === 'Librarian')) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Librarian or Admin access required' });
  }
};
