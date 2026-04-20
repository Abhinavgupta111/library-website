import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // Legacy backward compatibility
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  message: { type: String, default: '' },
  fileUrl: { type: String },
  isReported: { type: Boolean, default: false },
  pinned: { type: Boolean, default: false },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  reactions: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      emoji: { type: String }
    }
  ],
  deleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
