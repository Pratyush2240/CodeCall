import API from './axios';

/**
 * POST /rooms
 * Creates a new room, optionally linked to a project.
 * @param {string} [projectId]
 */
export async function createRoom(projectId = null) {
  const body = projectId ? { projectId } : {};
  const { data } = await API.post('/rooms', body);
  return data;
}

/**
 * POST /rooms/join
 * Joins an existing room by code.
 * @param {string} code
 */
export async function joinRoom(code) {
  const { data } = await API.post('/rooms/join', { code });
  return data;
}

/**
 * GET /rooms
 * Fetches the list of rooms the current user has access to.
 * @param {string} [projectId] — optional filter
 */
export async function getRooms(projectId = null) {
  const params = projectId ? { projectId } : {};
  const { data } = await API.get('/rooms', { params });
  return data;
}

/**
 * GET /rooms/:roomId
 * Fetches a single room by its ID.
 */
export async function getRoom(roomId) {
  const { data } = await API.get(`/rooms/${roomId}`);
  return data;
}

/**
 * PATCH /rooms/:roomId/end
 * Ends the room. Only the admin (createdBy) can call this.
 */
export async function endRoom(roomId) {
  const { data } = await API.patch(`/rooms/${roomId}/end`);
  return data;
}
