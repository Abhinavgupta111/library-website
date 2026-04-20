import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  entryTime: {
    type: Date,
    default: Date.now
  },
  exitTime: {
    type: Date
  },
  booksRead: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }],
  purpose: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['IN', 'OUT'],
    default: 'IN'
  },
  autoCheckout: {
    type: Boolean,
    default: false   // true when the system auto-closed the session after 12 h
  }
}, {
  timestamps: true
});

const Session = mongoose.model('Session', sessionSchema);

export default Session;
