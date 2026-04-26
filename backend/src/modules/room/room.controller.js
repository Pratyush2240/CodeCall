import { getRoomsForUser, createRoomForUser, joinRoomByCode, getRoomById, endRoom } from './room.service.js';
import AppError from '../../utils/appError.js';

/**
 * GET /api/rooms
 * Returns all rooms the authenticated user belongs to.
 */
export async function listRooms(req, res, next) {
  try {
    const rooms = getRoomsForUser(req.user.id);
    res.json(rooms);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/rooms
 * Creates a new room and adds the current user as the first participant.
 */
export async function createRoom(req, res, next) {
  try {
    const room = createRoomForUser(req.user.id);
    res.status(201).json(room);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/rooms/join
 * Joins an existing room by invite code.
 * Body: { code: string }
 */
export async function joinRoom(req, res, next) {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string' || !code.trim()) {
      return next(new AppError('Room code is required.', 400));
    }
    const room = joinRoomByCode(code.trim().toUpperCase(), req.user.id);
    res.json(room);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/rooms/:roomId
 * Returns a single room by ID. User must be a participant.
 */
export async function getRoom(req, res, next) {
  try {
    const room = getRoomById(req.params.roomId, req.user.id);
    res.json(room);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/rooms/:roomId/end
 * Ends a room. Only the admin (createdBy) can call this.
 */
export async function endRoomHandler(req, res, next) {
  try {
    const room = endRoom(req.params.roomId, req.user.id);
    res.json(room);
  } catch (err) {
    next(err);
  }
}
