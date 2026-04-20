import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * protect  —  Verifies the Bearer token and attaches req.user.
 * Will reject if JWT_SECRET is not set, or if the token is expired/invalid.
 */
export const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('[Security] JWT_SECRET is not set — refusing to process tokens.');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure the user still exists and is not locked
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({ message: 'Account is temporarily locked' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired, please log in again' });
    }
    console.error('[Security] Token verification failed:', err.message);
    return res.status(401).json({ message: 'Not authorized, token invalid' });
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

