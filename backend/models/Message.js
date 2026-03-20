import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For direct messages
  message: { type: String, default: '' },
  fileUrl: { type: String },
  isReported: { type: Boolean, default: false },
  pinned: { type: Boolean, default: false }
}, {
  timestamps: true
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
