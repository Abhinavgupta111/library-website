import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  total_copies: { type: Number, required: true, default: 1 },
  available_copies: { type: Number, required: true, default: 1 },
  publishedYear: { type: Number },
  publisher: { type: String },
  edition: { type: String },
  pages: { type: Number },
  shelf_location: {
    block: { type: String },
    rack: { type: String },
    floor: { type: String }
  },
  issued_to: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      issue_date: { type: Date, default: Date.now },
      return_date: { type: Date }
    }
  ]
}, {
  timestamps: true
});

bookSchema.index({ title: 'text', author: 'text' });

const Book = mongoose.model('Book', bookSchema);
export default Book;
