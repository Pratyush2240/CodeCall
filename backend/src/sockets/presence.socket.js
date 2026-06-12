// ─── Realtime presence tracking per room ───────────────────────
import { touchRoom } from "../modules/room/room.service.js";

// In-memory state — tracks who is connected to which room.

// roomId → Map<socketId, { userId, joinedAt }>
const roomUsers = new Map();

// socketId → roomId (reverse lookup for disconnect cleanup)
const socketToRoom = new Map();

/* ── Internal helpers ───────────────────────────────────────── */

function addUser(roomId, socketId, userId) {
  if (!roomUsers.has(roomId)) {
    roomUsers.set(roomId, new Map());
  }
  roomUsers.get(roomId).set(socketId, { userId, joinedAt: Date.now() });
  socketToRoom.set(socketId, roomId);
}

function removeUser(socketId) {
  const roomId = socketToRoom.get(socketId);
  if (!roomId) return null;

  const room = roomUsers.get(roomId);
  if (room) {
    room.delete(socketId);
    if (room.size === 0) roomUsers.delete(roomId);
  }
  socketToRoom.delete(socketId);
  return roomId;
}

/**
 * Build a de-duplicated user list for a room.
 * (A user with multiple tabs only appears once.)
 */
function getRoomUserList(roomId) {
  const room = roomUsers.get(roomId);
  if (!room) return [];

  const seen = new Set();
  const users = [];
  for (const [, { userId, joinedAt }] of room) {
    if (!seen.has(userId)) {
      seen.add(userId);
      users.push({ userId, joinedAt });
    }
  }
  return users;
}

/* ── Public API called from index.js ────────────────────────── */

/**
 * Track a user joining a room.
 * Broadcasts the updated user list to everyone in the room.
 */
export function trackJoin(io, socket, roomId) {
  addUser(roomId, socket.id, socket.user.userId);

  const users = getRoomUserList(roomId);
  io.to(roomId).emit("presence:update", { users, roomId });

  touchRoom(roomId).catch((err) => console.error("Failed to touch room on join:", err));

  console.log(`👥 Presence: ${users.length} user(s) in room ${roomId}`);
}

/**
 * Clean up when a socket disconnects.
 * Broadcasts the updated user list + a user-left event.
 */
export function trackDisconnect(io, socket) {
  const roomId = removeUser(socket.id);
  if (!roomId) return;

  const users = getRoomUserList(roomId);
  io.to(roomId).emit("presence:update", { users, roomId });

  socket.to(roomId).emit("presence:user-left", {
    userId: socket.user.userId,
  });

  console.log(`👥 Presence: ${users.length} user(s) in room ${roomId} (after leave)`);
}

/**
 * Register per-socket presence events (typing indicators).
 */
export const registerPresenceEvents = (io, socket) => {
  socket.on("presence:typing", ({ roomId, isTyping }) => {
    socket.to(roomId).emit("presence:typing", {
      userId: socket.user.userId,
      isTyping,
    });
  });
};
