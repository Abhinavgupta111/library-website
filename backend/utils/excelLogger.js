/**
 * excelLogger.js
 * Utility to append check-in / check-out records to a persistent Excel file.
 * Uses the xlsx package (already in devDependencies, works in production too).
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Place the Excel file one level up (inside /backend)
const EXCEL_PATH = path.join(__dirname, '..', 'checkin_log.xlsx');

const HEADERS = [
  'S.No',
  'Name',
  'Student ID',
  'Purpose',
  'Check-In Time',
  'Check-Out Time',
  'Status',
];

/**
 * Reads the existing workbook from disk, or creates a fresh one with headers.
 */
function getWorkbook() {
  if (fs.existsSync(EXCEL_PATH)) {
    return XLSX.readFile(EXCEL_PATH);
  }

  const wb  = XLSX.utils.book_new();
  const ws  = XLSX.utils.aoa_to_sheet([HEADERS]);

  // Column widths for readability
  ws['!cols'] = [
    { wch: 6 },   // S.No
    { wch: 28 },  // Name
    { wch: 28 },  // Student ID
    { wch: 24 },  // Purpose
    { wch: 22 },  // Check-In Time
    { wch: 22 },  // Check-Out Time
    { wch: 10 },  // Status
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Check-In Log');
  return wb;
}

/**
 * Appends a new check-in row to the Excel file.
 * @param {Object} session  - Mongoose session document
 */
export function logCheckIn(session) {
  try {
    const wb = getWorkbook();
    const ws = wb.Sheets['Check-In Log'];

    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    const nextRow = data.length + 1; // 1-indexed, header is row 1

    const checkInTime = session.entryTime
      ? new Date(session.entryTime).toLocaleString('en-IN', { hour12: true })
      : new Date().toLocaleString('en-IN', { hour12: true });

    const newRow = [
      nextRow - 1,                           // S.No (excluding header row)
      session.name   || '',
      session.studentId?.toString() || '',
      session.purpose || 'General Study',
      checkInTime,
      '',                                     // Check-Out Time (empty on entry)
      'IN',
    ];

    XLSX.utils.sheet_add_aoa(ws, [newRow], { origin: -1 }); // -1 appends after last row
    XLSX.writeFile(wb, EXCEL_PATH);
  } catch (err) {
    console.error('[excelLogger] logCheckIn error:', err.message);
  }
}

/**
 * Updates the check-out time and status for the row matching the session ID.
 * @param {Object} session  - Mongoose session document (after exit)
 */
export function logCheckOut(session) {
  try {
    if (!fs.existsSync(EXCEL_PATH)) return; // Nothing to update

    const wb   = getWorkbook();
    const ws   = wb.Sheets['Check-In Log'];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

    const studentIdStr = session.studentId?.toString();
    const checkInTime  = session.entryTime
      ? new Date(session.entryTime).toLocaleString('en-IN', { hour12: true })
      : '';
    const checkOutTime = session.exitTime
      ? new Date(session.exitTime).toLocaleString('en-IN', { hour12: true })
      : new Date().toLocaleString('en-IN', { hour12: true });

    // Column indices (0-based): StudentID=col2, CheckInTime=col4, CheckOut=col5, Status=col6
    const STUDENT_ID_COL  = 2;
    const CHECKIN_COL     = 4;
    const CHECKOUT_COL    = 5;
    const STATUS_COL      = 6;

    let updated = false;
    for (let r = 1; r < data.length; r++) {   // skip header row (index 0)
      // Match by student ID and check-in time to find the correct row
      if (
        data[r][STUDENT_ID_COL] === studentIdStr &&
        data[r][CHECKIN_COL]    === checkInTime &&
        data[r][STATUS_COL]     === 'IN'
      ) {
        const checkOutCell = XLSX.utils.encode_cell({ r, c: CHECKOUT_COL });
        const statusCell   = XLSX.utils.encode_cell({ r, c: STATUS_COL });
        ws[checkOutCell] = { v: checkOutTime, t: 's' };
        ws[statusCell]   = { v: 'OUT',       t: 's' };
        updated = true;
        break;
      }
    }

    if (updated) {
      XLSX.writeFile(wb, EXCEL_PATH);
    }
  } catch (err) {
    console.error('[excelLogger] logCheckOut error:', err.message);
  }
}

/** Returns the absolute path to the Excel file (for the download route). */
export function getExcelPath() {
  return EXCEL_PATH;
}
