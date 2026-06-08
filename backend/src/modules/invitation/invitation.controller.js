import * as invitationService from "./invitation.service.js";
import catchAsync from "../../utils/catchAsync.js";

/**
 * POST /api/rooms/:roomId/invite
 * Invite a user to a room.
 */
export const createInvite = catchAsync(async (req, res) => {
  const { roomId } = req.params;
  const { receiverId } = req.body;
  const senderId = req.user.id;

  const invitation = await invitationService.createInvitation(roomId, senderId, receiverId);

  res.status(201).json({
    status: "success",
    message: "Invitation sent successfully.",
    data: invitation,
  });
});

/**
 * GET /api/invitations
 * Get pending invitations for the current user.
 */
export const getMyInvites = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const invitations = await invitationService.getInvitationsForUser(userId);

  res.status(200).json({
    status: "success",
    data: invitations,
  });
});

/**
 * GET /api/rooms/:roomId/invitations
 * Get invitations sent for a specific room (room owner only).
 */
export const getRoomInvites = catchAsync(async (req, res) => {
  const { roomId } = req.params;
  const senderId = req.user.id;

  const invitations = await invitationService.getInvitationsForRoom(roomId, senderId);

  res.status(200).json({
    status: "success",
    data: invitations,
  });
});

/**
 * PATCH /api/invitations/:id/accept
 * Accept a room invitation.
 */
export const acceptInvite = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const room = await invitationService.acceptInvitation(id, userId);

  res.status(200).json({
    status: "success",
    message: "Invitation accepted. Redirecting to room.",
    data: room,
  });
});

/**
 * PATCH /api/invitations/:id/decline
 * Decline a room invitation.
 */
export const declineInvite = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const invitation = await invitationService.declineInvitation(id, userId);

  res.status(200).json({
    status: "success",
    message: "Invitation declined.",
    data: invitation,
  });
});

/**
 * DELETE /api/invitations/:id
 * Revoke/cancel a pending invitation.
 */
export const revokeInvite = catchAsync(async (req, res) => {
  const { id } = req.params;
  const senderId = req.user.id;

  await invitationService.revokeInvitation(id, senderId);

  res.status(200).json({
    status: "success",
    message: "Invitation revoked successfully.",
  });
});
