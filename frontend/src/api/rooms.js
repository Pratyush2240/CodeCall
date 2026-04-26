import API from './axios';

/**
 * POST /rooms
 * Creates a new room and returns the full room object.
 * @returns {Promise<{ id: string, name: string, [key: string]: any }>}
 */
export async function createRoom() {
  const { data } = await API.post('/rooms');
  return data;
}

/**
 * POST /rooms/join
 * Joins an existing room by code.
 * @param {string} code  — the room invite code entered by the user
 * @returns {Promise<{ id: string, name: string, [key: string]: any }>}
 */
export async function joinRoom(code) {
  const { data } = await API.post('/rooms/join', { code });
  return data;
}

/**
 * GET /rooms
 * Fetches the list of rooms the current user has access to.
 * @returns {Promise<Array<{ id: string, name: string, status: string, participants: number, lastUpdated: string }>>}
 */
export async function getRooms() {
  const { data } = await API.get('/rooms');
  return data;
}

/**
 * GET /rooms/:roomId
 * Fetches a single room by its ID.
 * @param {string} roomId
 * @returns {Promise<{ id: string, name: string, status: string, participants: string[], code: string }>}
 */
export async function getRoom(roomId) {
  const { data } = await API.get(`/rooms/${roomId}`);
  return data;
}

/**
 * PATCH /rooms/:roomId/end
 * Ends the room. Only the admin (createdBy) can call this.
 * @param {string} roomId
 * @returns {Promise<{ id: string, status: 'ended', endedAt: string }>}
 */
export async function endRoom(roomId) {
  const { data } = await API.patch(`/rooms/${roomId}/end`);
  return data;
}

