import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { 
    type: String, 
    required: true,
    minlength: 8
  },
  role: { type: String, enum: ['Student', 'Admin', 'Librarian'], default: 'Student' },
  branch: { type: String },
  year: { type: Number },
  roll_number: { type: String },
  pinnedChats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }],
  resetPasswordToken:  { type: String },
  resetPasswordExpire: { type: Date },
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
