import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['direct', 'group'], required: true },
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    ],
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // If it's a group, link to Group
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  { timestamps: true }
);

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
