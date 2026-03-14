import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Book from './models/Book.js';

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    await Book.deleteMany();

    const users = [
      { name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'Admin' },
      { name: 'Student One', email: 'student1@example.com', password: 'password123', role: 'Student', branch: 'CSE', year: 2 },
      { name: 'Librarian', email: 'lib@example.com', password: 'password123', role: 'Librarian' }
    ];

    const createdUsers = [];
    for (const user of users) {
        createdUsers.push(await User.create(user));
    }

    const adminUser = createdUsers[0]._id;

    await Book.insertMany([
      { title: 'Clean Code', author: 'Robert C. Martin', category: 'Programming', isbn: '9780132350884', total_copies: 5, available_copies: 5, shelf_location: { block: 'A', rack: '1', floor: '1' } },
      { title: 'Design Patterns', author: 'Gang of Four', category: 'Programming', isbn: '9780201633610', total_copies: 3, available_copies: 3, shelf_location: { block: 'A', rack: '2', floor: '1' } },
      { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', category: 'Computer Science', isbn: '9780262033848', total_copies: 10, available_copies: 10, shelf_location: { block: 'B', rack: '1', floor: '1' } }
    ]);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
