import { clerkClient } from '@clerk/clerk-sdk-node';
import User from '../models/User.js';

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Sync Clerk user with MongoDB after login / signup
//          Also accepts optional profile fields (branch, year, roll_number)
// @route   POST /api/auth/sync
// @access  Public (but validates Clerk Bearer token internally)
// ─────────────────────────────────────────────────────────────────────────────
export const syncUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) return res.status(401).json({ message: 'No token provided.' });

    // Verify the Clerk session token
    let payload;
    try {
      payload = await clerkClient.verifyToken(token);
    } catch {
      return res.status(401).json({ message: 'Invalid or expired session token.' });
    }

    const clerkId = payload.sub;

    // Fetch user details from Clerk
    const clerkUser = await clerkClient.users.getUser(clerkId);
    const email = clerkUser.emailAddresses?.[0]?.emailAddress || '';
    const name  = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';

    // Extract optional profile fields from body
    const { branch, year, roll_number } = req.body || {};

    // Find or create the MongoDB user
    let user = await User.findOne({ clerkId });

    if (!user) {
      // First time — create a new record
      user = await User.create({
        clerkId,
        name,
        email,
        role: 'Student',
        branch:      branch  || undefined,
        year:        year    ? Number(year) : undefined,
        roll_number: roll_number || undefined,
        profileComplete: !!(roll_number),
        lastLogin: new Date(),
      });
    } else {
      // Existing user — update name/email from Clerk & merge any new profile fields
      user.name      = name;
      user.email     = email;
      user.lastLogin = new Date();

      if (branch)      user.branch      = branch;
      if (year)        user.year        = Number(year);
      if (roll_number) {
        user.roll_number    = roll_number;
        user.profileComplete = true;
      }

      await user.save();
    }

    res.status(200).json({
      _id:             user._id,
      clerkId:         user.clerkId,
      name:            user.name,
      email:           user.email,
      role:            user.role,
      branch:          user.branch,
      year:            user.year,
      roll_number:     user.roll_number,
      profileComplete: user.profileComplete,
    });
  } catch (error) {
    console.error('[syncUser] Error:', error);
    res.status(500).json({ message: 'Server error during user sync.', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get current user's profile
// @route   GET /api/auth/profile
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update user profile (branch, year, roll_number, name)
// @route   PUT /api/auth/profile
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.name)        user.name        = req.body.name;
    if (req.body.branch)      user.branch      = req.body.branch;
    if (req.body.year)        user.year        = Number(req.body.year);
    if (req.body.roll_number) {
      user.roll_number    = req.body.roll_number;
      user.profileComplete = true;
    }

    const updated = await user.save();
    res.status(200).json({
      _id:             updated._id,
      name:            updated.name,
      email:           updated.email,
      role:            updated.role,
      branch:          updated.branch,
      year:            updated.year,
      roll_number:     updated.roll_number,
      profileComplete: updated.profileComplete,
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error during profile update.', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Search users by name or email
// @route   GET /api/auth/users/search
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name:  { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
          ],
        }
      : {};

    const users = await User.find({ ...keyword, _id: { $ne: req.user._id } })
      .select('name email role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
