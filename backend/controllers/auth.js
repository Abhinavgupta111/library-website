import { clerkClient } from '@clerk/clerk-sdk-node';
import User from '../models/User.js';

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Sync Clerk user with MongoDB after login / signup
//          Uses ClerkExpressWithAuth() on the route — req.auth is already set
// @route   POST /api/auth/sync
// @access  Clerk-verified
// ─────────────────────────────────────────────────────────────────────────────
export const syncUser = async (req, res) => {
  try {
    // Clerk v4 middleware populates req.auth
    const clerkId = req.auth?.userId;
    if (!clerkId) {
      return res.status(401).json({ message: 'Not authorized — no Clerk session.' });
    }

    // Fetch user details from Clerk API
    const clerkUser = await clerkClient.users.getUser(clerkId);
    const email = clerkUser.emailAddresses?.[0]?.emailAddress || '';
    const name  = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';

    // Extract optional profile fields from body
    const { branch, year, roll_number } = req.body || {};

    // Find or create the MongoDB user
    // 1. Look up by clerkId first
    let user = await User.findOne({ clerkId });

    // 2. If not found by clerkId, check if an OLD user exists with the same email
    //    (migration case: user signed up with old JWT system, now migrating to Clerk)
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        // Migrate old record — attach the new clerkId
        user.clerkId = clerkId;
        user.name    = name;
        user.lastLogin = new Date();
        if (branch)      user.branch      = branch;
        if (year)        user.year        = Number(year);
        if (roll_number) {
          user.roll_number     = roll_number;
          user.profileComplete = true;
        }
        // Mark profile complete if they already had a roll_number from before
        if (user.roll_number) user.profileComplete = true;
        await user.save();
      }
    }

    if (!user) {
      // Brand new user — create fresh
      user = await User.create({
        clerkId,
        name,
        email,
        role: 'Student',
        branch:      branch      || undefined,
        year:        year        ? Number(year) : undefined,
        roll_number: roll_number || undefined,
        profileComplete: !!(roll_number),
        lastLogin: new Date(),
      });
    } else if (user.clerkId === clerkId) {
      // Existing Clerk user — update name/email + any new profile fields
      user.name      = name;
      user.email     = email;
      user.lastLogin = new Date();
      if (branch)      user.branch      = branch;
      if (year)        user.year        = Number(year);
      if (roll_number) {
        user.roll_number     = roll_number;
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
// @access  Private (protect middleware sets req.user)
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
      user.roll_number     = req.body.roll_number;
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
