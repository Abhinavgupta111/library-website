import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import User from '../models/User.js';

/**
 * protect — Clerks ClerkExpressRequireAuth() verifies the Bearer token,
 * then we find the corresponding MongoDB user and attach it to req.user.
 */
export const protect = [
  ClerkExpressRequireAuth(),           // ← Clerk v4 standard middleware
  async (req, res, next) => {
    try {
      const clerkId = req.auth?.userId;
      if (!clerkId) {
        return res.status(401).json({ message: 'Not authorized, no user ID in token' });
      }

      const user = await User.findOne({ clerkId });
      if (!user) {
        return res.status(401).json({ message: 'User not found. Please complete sign-up.' });
      }

      req.user = user;
      next();
    } catch (err) {
      console.error('[Auth Middleware] Error:', err.message);
      return res.status(401).json({ message: 'Not authorized' });
    }
  }
];

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
