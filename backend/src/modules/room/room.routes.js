import { Router } from 'express';
import { listRooms, createRoom, joinRoom, getRoom, endRoomHandler, renameRoomHandler, deleteRoomHandler } from './room.controller.js';
import { requireAuth } from '../../middlewares/requireAuth.js';

const router = Router();

/* All room routes require authentication */
router.use(requireAuth);

/** GET /api/rooms — list rooms for the authenticated user */
router.get('/', listRooms);

/** POST /api/rooms — create a new room */
router.post('/', createRoom);

/** POST /api/rooms/join — join a room by code */
router.post('/join', joinRoom);

/** PATCH /api/rooms/:roomId/end — end a room (admin only) */
router.patch('/:roomId/end', endRoomHandler);

/** PATCH /api/rooms/:roomId/rename — rename a room (creator only) */
router.patch('/:roomId/rename', renameRoomHandler);

/** DELETE /api/rooms/:roomId — permanently delete a room (creator only) */
router.delete('/:roomId', deleteRoomHandler);

/** GET /api/rooms/:roomId — fetch a single room by ID */
router.get('/:roomId', getRoom);

export default router;
