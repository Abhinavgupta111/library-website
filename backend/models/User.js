import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true, index: true },
  name:    { type: String, required: true, trim: true, maxlength: 100 },
  email:   { type: String, required: true, unique: true, lowercase: true, trim: true },
  role:    { type: String, enum: ['Student', 'Admin', 'Librarian'], default: 'Student' },
  branch:  { type: String, maxlength: 100 },
  year:    { type: Number, min: 1, max: 6 },
  roll_number: { type: String, maxlength: 50 },
  pinnedChats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }],
  profileComplete: { type: Boolean, default: false }, // false until roll number is set
  lastLogin: { type: Date },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
export default User;
