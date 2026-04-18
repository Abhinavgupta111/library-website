/**
 * sheetsLogger.js
 * Writes check-in / check-out records to a live Google Sheet.
 * The sheet auto-updates — no download needed.
 */

import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath }  from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Config ────────────────────────────────────────────────────────────────────
const SHEET_ID   = '133OzT0ZuuhHMM62PphYsDv8DiNNcfbIKwiyKw0id3pg';
const SHEET_NAME = 'Sheet1';          // default tab name in a new Google Sheet
const CREDS_PATH = path.join(__dirname, '..', 'google-credentials.json');

// ── Auth ──────────────────────────────────────────────────────────────────────
function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDS_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

// ── Headers row ───────────────────────────────────────────────────────────────
const HEADERS = [
  'S.No', 'Name', 'Student ID', 'Purpose',
  'Check-In Date', 'Check-In Time',
  'Check-Out Date', 'Check-Out Time',
  'Status',
];

/**
 * Ensures the header row exists in the sheet.
 * Safe to call multiple times — only writes if the sheet is empty.
 */
async function ensureHeaders(sheets) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:A1`,
    });
    const existing = res.data.values;
    if (!existing || existing.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A1`,
        valueInputOption: 'RAW',
        requestBody: { values: [HEADERS] },
      });
    }
  } catch (err) {
    console.error('[sheetsLogger] ensureHeaders error:', err.message);
  }
}

/**
 * Gets the next available row number (1-indexed) in the sheet.
 */
async function getNextRow(sheets) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:A`,
  });
  return (res.data.values || []).length + 1;
}

// ── Locale helpers ────────────────────────────────────────────────────────────
function fmtDate(d) {
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtTime(d) {
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Appends a new check-in row.
 * @param {Object} session  - Mongoose session document
 */
export async function sheetsLogCheckIn(session) {
  try {
    const sheets  = getSheets();
    await ensureHeaders(sheets);
    const nextRow = await getNextRow(sheets);
    const sNo     = nextRow - 1; // serial number (excluding header)
    const entryDt = new Date(session.entryTime || Date.now());

    const row = [
      sNo,
      session.name || '',
      session.studentId?.toString() || '',
      session.purpose || 'General Study',
      fmtDate(entryDt),
      fmtTime(entryDt),
      '',                 // Check-Out Date (blank on entry)
      '',                 // Check-Out Time (blank on entry)
      'IN',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:I`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    });

    console.log(`[sheetsLogger] Check-in logged for ${session.name}`);
  } catch (err) {
    console.error('[sheetsLogger] sheetsLogCheckIn error:', err.message);
  }
}

/**
 * Finds the matching IN row for this student and updates check-out columns.
 * @param {Object} session  - Mongoose session document (after exit)
 */
export async function sheetsLogCheckOut(session) {
  try {
    const sheets = getSheets();

    // Read all rows to find the matching IN row
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:I`,
    });

    const rows = res.data.values || [];
    const studentIdStr = session.studentId?.toString() || '';
    const entryDt      = new Date(session.entryTime || Date.now());
    const entryDateStr = fmtDate(entryDt);
    const entryTimeStr = fmtTime(entryDt);
    const exitDt       = new Date(session.exitTime  || Date.now());

    // Find the row index (0-based in the array, 1-based in the sheet)
    // Match by StudentID (col 2) + Check-In Date (col 4) + Status=IN (col 8)
    let targetRowIndex = -1;
    for (let i = 1; i < rows.length; i++) {  // skip header at index 0
      const r = rows[i];
      if (
        r[2] === studentIdStr &&
        r[4] === entryDateStr &&
        r[5] === entryTimeStr &&
        r[8] === 'IN'
      ) {
        targetRowIndex = i + 1; // sheets rows are 1-indexed; +1 for header
        break;
      }
    }

    if (targetRowIndex === -1) {
      console.warn('[sheetsLogger] No matching IN row found for checkout.');
      return;
    }

    // Update columns G (Check-Out Date), H (Check-Out Time), I (Status)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!G${targetRowIndex}:I${targetRowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[fmtDate(exitDt), fmtTime(exitDt), 'OUT']],
      },
    });

    console.log(`[sheetsLogger] Check-out logged for ${session.name}`);
  } catch (err) {
    console.error('[sheetsLogger] sheetsLogCheckOut error:', err.message);
  }
}
