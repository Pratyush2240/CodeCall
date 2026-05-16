import { getRoomsForUser, createRoomForUser, joinRoomByCode, getRoomById, endRoom } from './room.service.js';
import AppError from '../../utils/appError.js';

/**
 * GET /api/rooms?projectId=xxx
 * Returns all rooms the authenticated user belongs to.
 * Optionally filter by projectId.
 */
export async function listRooms(req, res, next) {
  try {
    const rooms = await getRoomsForUser(req.user.id, req.query.projectId || null);
    res.json(rooms);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/rooms
 * Creates a new room. Optionally links to a project.
 * Body: { projectId?: string }
 */
export async function createRoom(req, res, next) {
  try {
    const room = await createRoomForUser(req.user.id, req.body.projectId || null);
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
    const room = await joinRoomByCode(code.trim().toUpperCase(), req.user.id);
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
    const room = await getRoomById(req.params.roomId, req.user.id);
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
    const room = await endRoom(req.params.roomId, req.user.id);
    res.json(room);
  } catch (err) {
    next(err);
  }
}
