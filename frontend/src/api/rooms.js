import API from './axios';

/**
 * POST /rooms
 * Creates a new room, optionally with a custom name and linked to a project.
 * @param {string} [name]      — optional room name
 * @param {string} [projectId]
 */
export async function createRoom(name = null, projectId = null) {
  const body = {};
  if (name && name.trim()) body.name = name.trim();
  if (projectId) body.projectId = projectId;
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
 * @param {number} [limit]     — optional max rooms
 */
export async function getRooms(projectId = null, limit = null) {
  const params = {};
  if (projectId) params.projectId = projectId;
  if (limit) params.limit = limit;
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

/**
 * PATCH /rooms/:roomId/rename
 * Renames a room. Only the creator can call this.
 * @param {string} roomId
 * @param {string} name
 */
export async function renameRoom(roomId, name) {
  const { data } = await API.patch(`/rooms/${roomId}/rename`, { name });
  return data;
}

/**
 * DELETE /rooms/:roomId
 * Permanently deletes a room. Only the creator can call this.
 * @param {string} roomId
 */
export async function deleteRoom(roomId) {
  await API.delete(`/rooms/${roomId}`);
}
