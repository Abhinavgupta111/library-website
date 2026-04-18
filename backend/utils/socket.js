/**
 * socket.js
 * Singleton holder for the Socket.io server instance.
 * Import setIO() once (in server.js) and getIO() anywhere else.
 */

let _io = null;

export function setIO(io) {
  _io = io;
}

export function getIO() {
  return _io;
}
