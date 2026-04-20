/**
 * autoCheckout.js
 * Runs every 5 minutes. Any session that has been IN for >= 12 hours
 * is automatically checked out and logged to Excel + Google Sheets.
 */

import Session from '../models/Session.js';
import { logCheckOut } from './excelLogger.js';
import { sheetsLogCheckOut } from './sheetsLogger.js';
import { getIO } from './socket.js';

const AUTO_CHECKOUT_HOURS = 12;           // hours before forced checkout
const CHECK_INTERVAL_MS   = 5 * 60 * 1000; // run every 5 minutes

export function startAutoCheckoutJob() {
  console.log(
    `[AutoCheckout] Job started — sessions open > ${AUTO_CHECKOUT_HOURS}h will be auto-closed every 5 min.`
  );

  const run = async () => {
    try {
      const cutoff = new Date(Date.now() - AUTO_CHECKOUT_HOURS * 60 * 60 * 1000);

      // Find all sessions that are still IN and started before the cutoff
      const staleSessions = await Session.find({
        status: 'IN',
        entryTime: { $lte: cutoff },
      });

      if (staleSessions.length === 0) return;

      console.log(`[AutoCheckout] Found ${staleSessions.length} session(s) to auto-close.`);

      for (const session of staleSessions) {
        session.exitTime = new Date();
        session.status   = 'OUT';
        session.autoCheckout = true;          // mark so admin can see
        await session.save();

        // Log to Excel
        logCheckOut(session);

        // Log to Google Sheets (fire-and-forget)
        sheetsLogCheckOut(session).catch(() => {});

        // Notify all connected admins in real-time
        const io = getIO();
        if (io) {
          io.emit('session_update', {
            action: 'auto_checkout',
            session,
            message: `${session.name} was automatically checked out after ${AUTO_CHECKOUT_HOURS} hours.`,
          });
        }

        console.log(
          `[AutoCheckout] Auto-checked-out: ${session.name} (in since ${session.entryTime.toISOString()})`
        );
      }
    } catch (err) {
      console.error('[AutoCheckout] Job error:', err.message);
    }
  };

  // Run immediately once on startup, then every 5 minutes
  run();
  return setInterval(run, CHECK_INTERVAL_MS);
}
