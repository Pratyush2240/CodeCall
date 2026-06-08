import { getRoomsForUser, createRoomForUser, joinRoomByCode, getRoomById, endRoom, renameRoom as renameRoomService, deleteRoom as deleteRoomService } from './room.service.js';
import AppError from '../../utils/appError.js';

/**
 * GET /api/rooms?projectId=xxx&limit=3
 * Returns rooms the authenticated user belongs to.
 * Optionally filter by projectId and limit count.
 */
export async function listRooms(req, res, next) {
  try {
    const projectId = req.query.projectId || null;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
    const rooms = await getRoomsForUser(req.user.id, projectId, limit);
    res.json(rooms);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/rooms
 * Creates a new room. Optionally links to a project.
 * Body: { name?: string, projectId?: string }
 */
export async function createRoom(req, res, next) {
  try {
    const room = await createRoomForUser(
      req.user.id,
      req.body.projectId || null,
      req.body.name || null
    );
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

/**
 * PATCH /api/rooms/:roomId/rename
 * Renames a room. Only the creator can call this.
 * Body: { name: string }
 */
export async function renameRoomHandler(req, res, next) {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return next(new AppError('Room name is required.', 400));
    }
    const result = await renameRoomService(req.params.roomId, req.user.id, name);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/rooms/:roomId
 * Permanently deletes a room. Only the creator can call this.
 */
export async function deleteRoomHandler(req, res, next) {
  try {
    await deleteRoomService(req.params.roomId, req.user.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
