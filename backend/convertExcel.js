import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workbook = XLSX.readFile(path.join(__dirname, '..', 'Fully_Corrected_ListofBooks.xlsx'));
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Skip the first 3 title rows, row 4 is the header
const rawData = XLSX.utils.sheet_to_json(sheet, { range: 3 });

console.log('Total raw rows:', rawData.length);
console.log('Column names:', Object.keys(rawData[0]));
console.log('\nFirst 5 rows:');
rawData.slice(0, 5).forEach((row, i) => console.log(JSON.stringify(row)));
console.log('\nLast 3 rows:');
rawData.slice(-3).forEach((row, i) => console.log(JSON.stringify(row)));

// Check for unique categories if publisher can serve as one
const publishers = [...new Set(rawData.map(r => r.Publisher).filter(Boolean))];
console.log('\nUnique Publishers:', publishers.length);
console.log(publishers.slice(0, 20));
