import mongoose from 'mongoose';

const issueRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  requested_date: { type: Date, default: Date.now },
  processed_date: { type: Date },
  notes: { type: String }
}, {
  timestamps: true
});

const IssueRequest = mongoose.model('IssueRequest', issueRequestSchema);
export default IssueRequest;
