import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { 
    type: String, 
    required: true,
    minlength: 8
  },
  role: { type: String, enum: ['Student', 'Admin', 'Librarian'], default: 'Student' },
  branch: { type: String, maxlength: 100 },
  year: { type: Number, min: 1, max: 6 },
  roll_number: { type: String, maxlength: 50 },
  pinnedChats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }],
  resetPasswordToken:  { type: String },
  resetPasswordExpire: { type: Date },
  // ── Brute-force / lockout fields ──
  loginAttempts: { type: Number, default: 0 },
  lockUntil:    { type: Date },
  lastLogin:    { type: Date },
}, {
  timestamps: true
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
