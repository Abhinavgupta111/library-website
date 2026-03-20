import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Book from './models/Book.js';

dotenv.config();
connectDB();

const books = [
  { title: 'The Pragmatic Programmer', author: 'David Thomas & Andrew Hunt', category: 'Programming', isbn: '9780135957059', total_copies: 4, available_copies: 4, shelf_location: { block: 'A', rack: '1', floor: '1' } },
  { title: 'Structure and Interpretation of Computer Programs', author: 'Harold Abelson', category: 'Computer Science', isbn: '9780262011532', total_copies: 3, available_copies: 3, shelf_location: { block: 'A', rack: '2', floor: '1' } },
  { title: 'The Art of Computer Programming', author: 'Donald Knuth', category: 'Computer Science', isbn: '9780201896831', total_copies: 2, available_copies: 2, shelf_location: { block: 'A', rack: '3', floor: '1' } },
  { title: 'Computer Networks', author: 'Andrew S. Tanenbaum', category: 'Networking', isbn: '9780132126953', total_copies: 5, available_copies: 5, shelf_location: { block: 'B', rack: '1', floor: '1' } },
  { title: 'Operating System Concepts', author: 'Abraham Silberschatz', category: 'Systems', isbn: '9781119800361', total_copies: 6, available_copies: 6, shelf_location: { block: 'B', rack: '2', floor: '1' } },
  { title: 'Database System Concepts', author: 'Abraham Silberschatz', category: 'Databases', isbn: '9780078022159', total_copies: 5, available_copies: 5, shelf_location: { block: 'B', rack: '3', floor: '1' } },
  { title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell & Peter Norvig', category: 'AI / ML', isbn: '9780136042594', total_copies: 4, available_copies: 4, shelf_location: { block: 'C', rack: '1', floor: '1' } },
  { title: 'Deep Learning', author: 'Ian Goodfellow', category: 'AI / ML', isbn: '9780262035613', total_copies: 3, available_copies: 3, shelf_location: { block: 'C', rack: '2', floor: '1' } },
  { title: 'Pattern Recognition and Machine Learning', author: 'Christopher Bishop', category: 'AI / ML', isbn: '9780387310732', total_copies: 2, available_copies: 2, shelf_location: { block: 'C', rack: '3', floor: '1' } },
  { title: 'Hands-On Machine Learning with Scikit-Learn', author: 'Aurélien Géron', category: 'AI / ML', isbn: '9781492032649', total_copies: 4, available_copies: 4, shelf_location: { block: 'C', rack: '4', floor: '1' } },
  { title: 'Data Structures and Algorithms in Python', author: 'Michael T. Goodrich', category: 'Programming', isbn: '9781118290279', total_copies: 5, available_copies: 5, shelf_location: { block: 'A', rack: '4', floor: '1' } },
  { title: 'Compilers: Principles, Techniques, and Tools', author: 'Alfred V. Aho', category: 'Computer Science', isbn: '9780321486813', total_copies: 3, available_copies: 3, shelf_location: { block: 'A', rack: '5', floor: '1' } },
  { title: 'Computer Organization and Design', author: 'David A. Patterson', category: 'Computer Architecture', isbn: '9780128201091', total_copies: 4, available_copies: 4, shelf_location: { block: 'B', rack: '4', floor: '1' } },
  { title: 'Discrete Mathematics and Its Applications', author: 'Kenneth H. Rosen', category: 'Mathematics', isbn: '9781259676512', total_copies: 6, available_copies: 6, shelf_location: { block: 'D', rack: '1', floor: '1' } },
  { title: 'Linear Algebra and Its Applications', author: 'Gilbert Strang', category: 'Mathematics', isbn: '9780030105678', total_copies: 4, available_copies: 4, shelf_location: { block: 'D', rack: '2', floor: '1' } },
  { title: 'Probability and Statistics for Engineering and the Sciences', author: 'Jay Devore', category: 'Mathematics', isbn: '9781305251809', total_copies: 4, available_copies: 4, shelf_location: { block: 'D', rack: '3', floor: '1' } },
  { title: 'Cloud Computing: Concepts, Technology & Architecture', author: 'Thomas Erl', category: 'Cloud', isbn: '9780133387520', total_copies: 3, available_copies: 3, shelf_location: { block: 'C', rack: '5', floor: '2' } },
  { title: 'Kubernetes: Up and Running', author: 'Brendan Burns', category: 'Cloud', isbn: '9781492046530', total_copies: 3, available_copies: 3, shelf_location: { block: 'C', rack: '6', floor: '2' } },
  { title: 'Cybersecurity Essentials', author: 'Charles J. Brooks', category: 'Cybersecurity', isbn: '9781587133336', total_copies: 4, available_copies: 4, shelf_location: { block: 'E', rack: '1', floor: '2' } },
  { title: 'Hacking: The Art of Exploitation', author: 'Jon Erickson', category: 'Cybersecurity', isbn: '9781593271442', total_copies: 2, available_copies: 2, shelf_location: { block: 'E', rack: '2', floor: '2' } },
  { title: 'Web Development with Node and Express', author: 'Ethan Brown', category: 'Web Development', isbn: '9781491902295', total_copies: 4, available_copies: 4, shelf_location: { block: 'A', rack: '6', floor: '2' } },
  { title: 'Learning React', author: 'Alex Banks & Eve Porcello', category: 'Web Development', isbn: '9781492051725', total_copies: 4, available_copies: 4, shelf_location: { block: 'A', rack: '7', floor: '2' } },
  { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', category: 'Web Development', isbn: '9780596517748', total_copies: 5, available_copies: 5, shelf_location: { block: 'A', rack: '8', floor: '2' } },
  { title: 'Python Crash Course', author: 'Eric Matthes', category: 'Programming', isbn: '9781593279288', total_copies: 6, available_copies: 6, shelf_location: { block: 'A', rack: '9', floor: '2' } },
  { title: 'Automate the Boring Stuff with Python', author: 'Al Sweigart', category: 'Programming', isbn: '9781593279929', total_copies: 5, available_copies: 5, shelf_location: { block: 'A', rack: '10', floor: '2' } },
  { title: 'Blockchain Revolution', author: 'Don Tapscott', category: 'Emerging Tech', isbn: '9781101980132', total_copies: 3, available_copies: 3, shelf_location: { block: 'F', rack: '1', floor: '2' } },
  { title: 'IoT: Internet of Things', author: 'Raj Kamal', category: 'Emerging Tech', isbn: '9789332578548', total_copies: 4, available_copies: 4, shelf_location: { block: 'F', rack: '2', floor: '2' } },
  { title: 'Software Engineering', author: 'Ian Sommerville', category: 'Software Engineering', isbn: '9780133943030', total_copies: 5, available_copies: 5, shelf_location: { block: 'G', rack: '1', floor: '2' } },
  { title: 'Refactoring: Improving the Design of Existing Code', author: 'Martin Fowler', category: 'Software Engineering', isbn: '9780201485677', total_copies: 3, available_copies: 3, shelf_location: { block: 'G', rack: '2', floor: '2' } },
  { title: 'The Mythical Man-Month', author: 'Frederick P. Brooks Jr.', category: 'Software Engineering', isbn: '9780201835953', total_copies: 3, available_copies: 3, shelf_location: { block: 'G', rack: '3', floor: '2' } },
];

const seedBooks = async () => {
  try {
    let added = 0, skipped = 0;
    for (const b of books) {
      const exists = await Book.findOne({ isbn: b.isbn });
      if (!exists) {
        await Book.create(b);
        added++;
      } else {
        skipped++;
      }
    }
    console.log(`Done! Added: ${added}, Skipped (already exist): ${skipped}`);
    process.exit();
  } catch (error) {
    console.error('Error: ' + error.message);
    process.exit(1);
  }
};

setTimeout(seedBooks, 2000);
