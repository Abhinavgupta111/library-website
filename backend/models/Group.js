import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  group_name: { type: String, required: true },
  group_type: { type: String, enum: ['Official', 'Society', 'Event', 'Student'], default: 'Student' },
  description: { type: String },
  is_official: { type: Boolean, default: false },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, enum: ['Admin', 'Moderator', 'Member'], default: 'Member' }
    }
  ]
}, {
  timestamps: true
});

const Group = mongoose.model('Group', groupSchema);
export default Group;
