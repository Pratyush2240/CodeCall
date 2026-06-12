import prisma from "../../config/prisma.js";
import AppError from "../../utils/appError.js";

/**
 * Helper to update expired pending invitations to EXPIRED status
 */
const autoExpireInvitations = async () => {
  const now = new Date();
  await prisma.roomInvitation.updateMany({
    where: {
      status: "PENDING",
      expiresAt: { lt: now },
    },
    data: {
      status: "EXPIRED",
    },
  });
};

/**
 * Send invitation (Room owner only)
 */
export async function createInvitation(roomId, senderId, receiverId) {
  if (senderId === receiverId) {
    throw new AppError("You cannot invite yourself to a room.", 400);
  }

  // 1. Check if room exists and is ACTIVE
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      participants: {
        where: { userId: receiverId },
      },
    },
  });

  if (!room) {
    throw new AppError("Room not found.", 404);
  }
  if (room.status !== "ACTIVE") {
    throw new AppError("Cannot invite users to an ended room.", 400);
  }

  // 2. Validate sender is the room creator
  if (room.createdById !== senderId) {
    throw new AppError("Only the room creator can invite other users.", 403);
  }

  // 3. Validate receiver exists
  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
  });
  if (!receiver) {
    throw new AppError("Receiver user not found.", 404);
  }

  // 4. Check if receiver is already in room
  if (room.participants.length > 0) {
    throw new AppError("User is already a participant in this room.", 400);
  }

  // Clean up any stale expired invitations first
  await autoExpireInvitations();

  // 5. Check if there's already an active/pending invitation
  const existingInvite = await prisma.roomInvitation.findUnique({
    where: {
      roomId_receiverId: {
        roomId,
        receiverId,
      },
    },
  });

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  if (existingInvite) {
    if (existingInvite.status === "PENDING") {
      throw new AppError("An invitation is already pending for this user.", 400);
    }
    // If DECLINED, EXPIRED, or ACCEPTED, we allow re-invitation by upserting/replacing it.
    // Note: if it was ACCEPTED, they aren't currently in the room (checked in step 4), so they could have left.
    // We update it to PENDING and reset timestamps.
    return await prisma.roomInvitation.update({
      where: { id: existingInvite.id },
      data: {
        status: "PENDING",
        senderId,
        createdAt: new Date(),
        expiresAt,
      },
    });
  }

  // Create new invitation
  return await prisma.roomInvitation.create({
    data: {
      roomId,
      senderId,
      receiverId,
      expiresAt,
    },
  });
}

/**
 * Get all pending invitations for a user (receiver)
 */
export async function getInvitationsForUser(userId) {
  // First, auto-expire older ones
  await autoExpireInvitations();

  return await prisma.roomInvitation.findMany({
    where: {
      receiverId: userId,
      status: "PENDING",
    },
    include: {
      room: {
        select: {
          id: true,
          name: true,
          code: true,
          status: true,
        },
      },
      sender: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Accept a room invitation
 */
export async function acceptInvitation(invitationId, userId) {
  await autoExpireInvitations();

  const invitation = await prisma.roomInvitation.findUnique({
    where: { id: invitationId },
    include: {
      room: true,
    },
  });

  if (!invitation) {
    throw new AppError("Invitation not found.", 404);
  }
  if (invitation.receiverId !== userId) {
    throw new AppError("This invitation was not sent to you.", 403);
  }
  if (invitation.status === "EXPIRED" || (invitation.status === "PENDING" && invitation.expiresAt < new Date())) {
    if (invitation.status === "PENDING") {
      await prisma.roomInvitation.update({
        where: { id: invitationId },
        data: { status: "EXPIRED" },
      });
    }
    throw new AppError("This invitation has expired.", 400);
  }
  if (invitation.status !== "PENDING") {
    throw new AppError(`Invitation has already been ${invitation.status.toLowerCase()}.`, 400);
  }
  if (invitation.room.status !== "ACTIVE") {
    throw new AppError("The room is no longer active.", 400);
  }

  // Execute in transaction: accept invite, add participant, update room activity
  const [updatedInvite, participant, updatedRoom] = await prisma.$transaction([
    prisma.roomInvitation.update({
      where: { id: invitationId },
      data: { status: "ACCEPTED" },
    }),
    prisma.roomParticipant.upsert({
      where: {
        userId_roomId: {
          userId,
          roomId: invitation.roomId,
        },
      },
      update: {}, // if exists, do nothing
      create: {
        userId,
        roomId: invitation.roomId,
      },
    }),
    prisma.room.update({
      where: { id: invitation.roomId },
      data: { lastActivityAt: new Date() },
    }),

  ]);

  return invitation.room;
}

/**
 * Decline room invitation
 */
export async function declineInvitation(invitationId, userId) {
  await autoExpireInvitations();

  const invitation = await prisma.roomInvitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    throw new AppError("Invitation not found.", 404);
  }
  if (invitation.receiverId !== userId) {
    throw new AppError("This invitation was not sent to you.", 403);
  }
  if (invitation.status !== "PENDING") {
    throw new AppError(`Invitation is already ${invitation.status.toLowerCase()}.`, 400);
  }

  return await prisma.roomInvitation.update({
    where: { id: invitationId },
    data: { status: "DECLINED" },
  });
}

/**
 * Revoke/cancel room invitation (Sender/Room owner only)
 */
export async function revokeInvitation(invitationId, senderId) {
  const invitation = await prisma.roomInvitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    throw new AppError("Invitation not found.", 404);
  }
  if (invitation.senderId !== senderId) {
    throw new AppError("Only the invitation sender can revoke it.", 403);
  }

  // Delete the invitation completely from database
  return await prisma.roomInvitation.delete({
    where: { id: invitationId },
  });
}

/**
 * List all invitations sent for a specific room (for owner/host view in InviteModal)
 */
export async function getInvitationsForRoom(roomId, senderId) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    throw new AppError("Room not found.", 404);
  }
  if (room.createdById !== senderId) {
    throw new AppError("Only the room creator can access this information.", 403);
  }

  // First auto-expire old ones
  await autoExpireInvitations();

  return await prisma.roomInvitation.findMany({
    where: {
      roomId,
    },
    include: {
      receiver: {
        select: {
          id: true,
          username: true,
          fullName: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
