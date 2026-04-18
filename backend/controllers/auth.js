import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, branch, year, roll_number } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Password complexity check: 8+ chars, upper, lower, digit, special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
            message: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.' 
        });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password, // Password hashing is handled by the Mongoose pre-save hook in User.js
      role: role || 'Student',
      branch,
      year,
      roll_number,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        year: user.year,
        roll_number: user.roll_number,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received. Could not create account.' });
    }
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if(!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    // Verify user exists AND password is correct
    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        year: user.year,
        roll_number: user.roll_number,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search users by name or email
// @route   GET /api/auth/users/search
// @access  Private
export const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
          ],
        }
      : {};

    // Do not return the current user
    const users = await User.find({ ...keyword, _id: { $ne: req.user._id } }).select('name email role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.branch = req.body.branch || user.branch;
      user.year = req.body.year || user.year;
      user.roll_number = req.body.roll_number || user.roll_number;

      if (req.body.password) {
        // Password complexity check
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(req.body.password)) {
            return res.status(400).json({ 
                message: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.' 
            });
        }
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        branch: updatedUser.branch,
        year: updatedUser.year,
        roll_number: updatedUser.roll_number,
        token: generateToken(updatedUser._id), // re-issue token just in case
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: 'Server error during profile update.', error: error.message });
  }
};

// ── Nodemailer transporter (Gmail App Password) ─────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,  // Gmail App Password (not your normal password)
    },
  });
}

// @desc    Send password reset link to registered email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Please provide your email address.' });

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether the email exists — security best practice
      return res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    // Generate secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken  = hashedToken;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // Build reset URL (frontend route)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${rawToken}`;

    const mailOptions = {
      from: `"MAIT Library" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🔐 Password Reset Request — MAIT Library',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 32px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #4f6ef7; margin-bottom: 8px;">MAIT Library — Password Reset</h2>
          <p style="color: #4a5568;">Hello <strong>${user.name}</strong>,</p>
          <p style="color: #4a5568;">We received a request to reset your password. Click the button below to create a new password. This link is valid for <strong>1 hour</strong>.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background: #4f6ef7; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Reset My Password</a>
          </div>
          <p style="color: #718096; font-size: 13px;">If you did not request this, you can safely ignore this email. Your password will not change.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="color: #a0aec0; font-size: 12px; text-align: center;">MAIT Library System · IT Department</p>
        </div>
      `,
    };

    await createTransporter().sendMail(mailOptions);
    res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    // Clean up token if mail failed
    try {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        user.resetPasswordToken  = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
      }
    } catch (_) {}
    res.status(500).json({ message: 'Failed to send email. Please try again later.' });
  }
};

// @desc    Reset password using token from email link
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ message: 'Please provide a new password.' });

    // Hash the incoming token and look it up
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpire: { $gt: Date.now() },  // not expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired. Please request a new one.' });
    }

    // Password complexity check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.',
      });
    }

    user.password            = password;  // pre-save hook will hash it
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful! You can now log in.' });

  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Server error during password reset.', error: error.message });
  }
};
