import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import Book from './models/Book.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const seedFromExcel = async () => {
  try {
    const dataPath = path.join(__dirname, 'booksData.json');
    if (!fs.existsSync(dataPath)) {
      console.error('booksData.json not found. Please run convertExcelToJson.js first.');
      process.exit(1);
    }

    const booksData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
    let added = 0;
    let skipped = 0;
    
    // We process sequentially to check for existing ISBNs reliably
    for (const b of booksData) {
      if (!b.isbn) continue;
      
      const exists = await Book.findOne({ isbn: b.isbn });
      if (!exists) {
        await Book.create(b);
        added++;
        if (added % 50 === 0) console.log(`Inserted ${added} books...`);
      } else {
        skipped++;
      }
    }
    
    console.log(`\nImport Complete!`);
    console.log(`Added newly: ${added}`);
    console.log(`Skipped (already existed): ${skipped}`);
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error.message);
    process.exit(1);
  }
};

// Delay to allow MongoDB connection to establish
setTimeout(seedFromExcel, 2000);
