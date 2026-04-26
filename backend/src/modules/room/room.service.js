import { randomUUID } from 'crypto';
import AppError from '../../utils/appError.js';

/* ─── In-memory store (swap for a real DB layer later) ─────────────────── */
const roomStore = new Map();

/**
 * Generate a short, human-readable invite code.
 * @returns {string}  e.g. "A3F-9KZ"
 */
const generateCode = () =>
  Math.random().toString(36).slice(2, 5).toUpperCase() +
  '-' +
  Math.random().toString(36).slice(2, 5).toUpperCase();

/* ─── Service Functions ─────────────────────────────────────────────────── */

/**
 * Returns all rooms the given user is a participant of.
 * @param {string} userId
 * @returns {Array}
 */
export function getRoomsForUser(userId) {
  return [...roomStore.values()].filter(room =>
    room.participants.includes(userId)
  );
}

/**
 * Creates a new room owned by the given user.
 * @param {string} userId
 * @returns {Object}
 */
export function createRoomForUser(userId) {
  const id = randomUUID();
  const room = {
    id,
    name:         `room-${id.slice(0, 6)}`,
    code:         generateCode(),
    status:       'active',
    createdBy:    userId,          // ← admin / host
    participants: [userId],
    lastUpdated:  new Date().toISOString(),
    createdAt:    new Date().toISOString(),
  };
  roomStore.set(id, room);
  return room;
}

/**
 * Joins an existing room by invite code.
 * @param {string} code
 * @param {string} userId
 * @returns {Object}
 */
export function joinRoomByCode(code, userId) {
  const room = [...roomStore.values()].find(r => r.code === code);
  if (!room) throw new AppError('Room not found. Check the code and try again.', 404);
  if (!room.participants.includes(userId)) {
    room.participants.push(userId);
    room.lastUpdated = new Date().toISOString();
  }
  return room;
}

/**
 * Returns a single room by ID.
 * @param {string} id
 * @param {string} userId  — must be a participant
 * @returns {Object}
 */
export function getRoomById(id, userId) {
  const room = roomStore.get(id);
  if (!room) throw new AppError('Room not found.', 404);
  if (!room.participants.includes(userId)) {
    throw new AppError('You are not a participant of this room.', 403);
  }
  return room;
}

/**
 * Ends a room. Only the room admin (createdBy) can do this.
 * Sets status to 'ended' and clears participants.
 * @param {string} id
 * @param {string} userId
 * @returns {Object}
 */
export function endRoom(id, userId) {
  const room = roomStore.get(id);
  if (!room) throw new AppError('Room not found.', 404);
  if (room.createdBy !== userId) {
    throw new AppError('Only the room admin can end this room.', 403);
  }
  if (room.status === 'ended') {
    throw new AppError('Room has already been ended.', 409);
  }
  room.status      = 'ended';
  room.endedAt     = new Date().toISOString();
  room.lastUpdated = new Date().toISOString();
  return room;
}
