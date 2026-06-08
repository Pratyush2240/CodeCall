import API from './axios';

/**
 * POST /rooms/:roomId/invite
 * Send a room invitation to a registered user.
 */
export const sendInvitation = (roomId, receiverId) =>
  API.post(`/rooms/${roomId}/invite`, { receiverId }).then((r) => r.data.data);

/**
 * GET /invitations
 * Fetch all pending room invitations for the current user.
 */
export const getMyInvitations = () =>
  API.get('/invitations').then((r) => r.data.data);

/**
 * GET /rooms/:roomId/invitations
 * Fetch all invitations sent for a specific room.
 */
export const getRoomInvitations = (roomId) =>
  API.get(`/rooms/${roomId}/invitations`).then((r) => r.data.data);

/**
 * PATCH /invitations/:id/accept
 * Accept a room invitation.
 */
export const acceptInvitation = (invitationId) =>
  API.patch(`/invitations/${invitationId}/accept`).then((r) => r.data.data);

/**
 * PATCH /invitations/:id/decline
 * Decline a room invitation.
 */
export const declineInvitation = (invitationId) =>
  API.patch(`/invitations/${invitationId}/decline`).then((r) => r.data.data);

/**
 * DELETE /invitations/:id
 * Revoke/cancel a pending invitation.
 */
export const revokeInvitation = (invitationId) =>
  API.delete(`/invitations/${invitationId}`).then((r) => r.data.data);
