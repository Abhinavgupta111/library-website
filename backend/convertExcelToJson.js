import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATEGORIES = {
  'Programming': ['c', 'c++', 'java', 'python', 'programming', 'programmer'],
  'Computer Science': ['algorithm', 'data structure', 'compiler', 'comput', 'logic'],
  'AI / ML': ['ai', 'machine learning', 'deep learning', 'neural', 'artificial intelligence', 'pattern recognition'],
  'Networking': ['network', 'communication', 'wireless', 'data communication'],
  'Systems': ['operating system', 'system', 'architecture', 'microprocessor'],
  'Databases': ['database', 'sql', 'big data', 'dbms'],
  'Cloud': ['cloud', 'kubernetes', 'docker', 'distributed'],
  'Cybersecurity': ['security', 'hacking', 'cryptography', 'cyber'],
  'Web Development': ['web', 'html', 'css', 'javascript', 'react', 'node', 'internet'],
  'Mathematics': ['math', 'discrete', 'algebra', 'probability', 'statistics', 'calculus'],
  'Emerging Tech': ['blockchain', 'iot', 'internet of things'],
  'Software Engineering': ['software', 'refactoring', 'agile', 'testing']
};

function assignCategory(title) {
  const lowerTitle = String(title).toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(kw => lowerTitle.includes(kw))) {
      return category;
    }
  }
  return 'Computer Science'; // fallback
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

try {
  const workbook = XLSX.readFile(path.join(__dirname, '..', 'Fully_Corrected_ListofBooks.xlsx'));
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // The first 3 rows are titles. Row 4 is header.
  const rawData = XLSX.utils.sheet_to_json(sheet, { range: 3 });

  const books = rawData.map((row, index) => {
    let pages = parseInt(row.Page) || 0;
    let year = parseInt(row.Year) || 2000;

    // Fix swapped Page/Year
    if (year < 1900 && pages > 1900 && pages < 2100) {
      const temp = year;
      year = pages;
      pages = temp;
    } else if (pages > 1900 && pages < 2100 && (year < 1900 || year > 2100)) {
        const temp = year;
        year = pages;
        pages = temp;
    }

    const uniqueIsbn = String(row['Accession no']).trim().toLowerCase() === 'specimen copy' 
      ? `SPECIMEN-${row['S.No'] || index}` 
      : String(row['Accession no']).trim();



    return {
      title: String(row.Title || 'Unknown Title').trim(),
      author: String(row.Author || 'Unknown Author').trim(),
      category: assignCategory(row.Title),
      isbn: uniqueIsbn,
      publishedYear: year,
      publisher: String(row.Publisher || 'Unknown').trim(),
      edition: String(row.Edition || 'First').trim(),
      pages: pages,
      total_copies: 1,
      available_copies: 1
    };
  });

  fs.writeFileSync(path.join(__dirname, 'booksData.json'), JSON.stringify(books, null, 2));
  console.log(`Successfully converted ${books.length} books to booksData.json`);
} catch (err) {
  console.error('Error converting excel:', err);
}
