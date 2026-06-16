import prisma from "../../config/prisma.js";
import AppError from "../../utils/appError.js";
import crypto from "crypto";

/**
 * Generate a short, human-readable invite code.
 * @returns {string}  e.g. "A3F-9KZ"
 */
const generateCode = () =>
  Math.random().toString(36).slice(2, 5).toUpperCase() +
  "-" +
  Math.random().toString(36).slice(2, 5).toUpperCase();

/* ─── Service Functions ─────────────────────────────────────────────────── */

/**
 * Returns rooms the given user participates in.
 * @param {string}  userId
 * @param {string|null}  projectId  — optional project filter
 * @param {number|null}  limit      — optional max rooms to return
 */
export async function getRoomsForUser(userId, projectId = null, limit = null) {
  const where = {
    participants: { some: { userId } },
  };
  if (projectId) where.projectId = projectId;

  const query = {
    where,
    include: {
      createdBy: { select: { id: true, username: true } },
      _count: { select: { participants: true } },
    },
    orderBy: { lastActivityAt: "desc" },
  };
  if (limit && Number.isInteger(limit) && limit > 0) {
    query.take = limit;
  }

  const rooms = await prisma.room.findMany(query);

  // We should also run active room expiration during listing to be safe
  for (const room of rooms) {
    if (room.status === "ACTIVE" && Date.now() - new Date(room.lastActivityAt).getTime() > 3 * 60 * 60 * 1000) {
      room.status = "ENDED";
      room.endedAt = new Date();
      expireRoom(room.id).catch(err => console.error("Auto expire during list failed:", err));
    }
  }

  return rooms.map((r) => {
    const isAutoEnded = r.status === "ENDED" && r.endedAt && r.lastActivityAt && 
      (new Date(r.endedAt).getTime() - new Date(r.lastActivityAt).getTime() >= 3 * 60 * 60 * 1000 - 10000);
    return {
      id: r.id,
      name: r.name,
      code: r.code,
      status: r.status,
      createdBy: r.createdById,
      createdByName: r.createdBy.username,
      participants: r._count.participants,
      projectId: r.projectId,
      lastUpdated: r.updatedAt.toISOString(),
      lastActivity: r.lastActivityAt.toISOString(),
      lastActivityAt: r.lastActivityAt.toISOString(),
      createdAt: r.createdAt.toISOString(),
      endedAt: r.endedAt?.toISOString() || null,
      autoEnded: isAutoEnded,
    };
  });

}

/**
 * Creates a new room owned by the given user.
 * @param {string}      userId
 * @param {string|null} projectId
 * @param {string|null} name — optional custom room name
 */
export async function createRoomForUser(userId, projectId = null, name = null) {
  const id = crypto.randomUUID();
  const code = generateCode();

  // Use provided name or generate a default
  const roomName = name && name.trim()
    ? name.trim().slice(0, 50)
    : `Room ${code}`;

  const data = {
    id,
    name: roomName,
    code,
    status: "ACTIVE",
    createdById: userId,
    participants: {
      create: { userId },
    },
  };

  if (projectId) {
    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError("Project not found.", 404);
    data.projectId = projectId;
  }

  const room = await prisma.room.create({
    data,
    include: {
      createdBy: { select: { id: true, username: true } },
      _count: { select: { participants: true } },
    },
  });

  return {
    id: room.id,
    name: room.name,
    code: room.code,
    status: room.status,
    createdBy: room.createdById,
    createdByName: room.createdBy.username,
    participants: [userId],
    projectId: room.projectId,
    lastUpdated: room.updatedAt.toISOString(),
    lastActivity: room.lastActivityAt.toISOString(),
    lastActivityAt: room.lastActivityAt.toISOString(),
    createdAt: room.createdAt.toISOString(),
    autoEnded: false,
  };

}

/**
 * Joins an existing room by invite code.
 */
export async function joinRoomByCode(code, userId) {
  const room = await prisma.room.findUnique({
    where: { code },
    include: {
      participants: { select: { userId: true } },
    },
  });

  if (!room) throw new AppError("Room not found. Check the code and try again.", 404);

  // Lazy expiration check
  await checkAndExpireRoom(room);

  if (room.status === "ENDED") throw new AppError("This room has ended.", 410);

  // Upsert participant
  const isAlready = room.participants.some((p) => p.userId === userId);
  if (!isAlready) {
    await prisma.roomParticipant.create({
      data: { userId, roomId: room.id },
    });
  }

  // Touch activity
  const updated = await prisma.room.update({
    where: { id: room.id },
    data: { lastActivityAt: new Date() },
    include: {
      createdBy: { select: { id: true, username: true } },
      participants: { select: { userId: true } },
    },
  });

  return {
    id: updated.id,
    name: updated.name,
    code: updated.code,
    status: updated.status,
    createdBy: updated.createdById,
    participants: updated.participants.map((p) => p.userId),
    projectId: updated.projectId,
    lastUpdated: updated.updatedAt.toISOString(),
    lastActivity: updated.lastActivityAt.toISOString(),
    lastActivityAt: updated.lastActivityAt.toISOString(),
    createdAt: updated.createdAt.toISOString(),
    autoEnded: false,
  };

}

/**
 * Returns a single room by ID. User must be a participant.
 */
export async function getRoomById(id, userId) {
  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, username: true } },
      participants: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            }
          }
        }
      },
    },
  });

  if (!room) throw new AppError("Room not found.", 404);

  // Lazy expiration check
  await checkAndExpireRoom(room);

  // Block re-entry to ended rooms
  if (room.status === "ENDED") {
    throw new AppError("This room has expired due to inactivity.", 410);
  }

  const isParticipant = room.participants.some((p) => p.userId === userId);
  if (!isParticipant) {
    throw new AppError("You are not a participant of this room.", 403);
  }

  const isAutoEnded = room.status === "ENDED" && room.endedAt && room.lastActivityAt && 
    (new Date(room.endedAt).getTime() - new Date(room.lastActivityAt).getTime() >= 3 * 60 * 60 * 1000 - 10000);

  return {
    id: room.id,
    name: room.name,
    code: room.code,
    status: room.status,
    createdBy: room.createdById,
    createdByName: room.createdBy.username,
    participants: room.participants.map((p) => p.userId),
    participantDetails: room.participants.map((p) => ({
      id: p.user.id,
      username: p.user.username,
      avatar: p.user.avatar,
    })),
    projectId: room.projectId,
    lastUpdated: room.updatedAt.toISOString(),
    lastActivity: room.lastActivityAt.toISOString(),
    lastActivityAt: room.lastActivityAt.toISOString(),
    createdAt: room.createdAt.toISOString(),
    endedAt: room.endedAt?.toISOString() || null,
    autoEnded: isAutoEnded,
  };
}

/**
 * Ends a room. Only the room creator can do this.
 */
export async function endRoom(id, userId) {
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) throw new AppError("Room not found.", 404);
  if (room.createdById !== userId) {
    throw new AppError("Only the room admin can end this room.", 403);
  }
  if (room.status === "ENDED") {
    throw new AppError("Room has already been ended.", 409);
  }

  const updated = await prisma.room.update({
    where: { id },
    data: {
      status: "ENDED",
      endedAt: new Date(),
      lastActivityAt: new Date(),
    },
  });

  try {
    const { disconnectRoomSockets } = await import("../../sockets/index.js");
    disconnectRoomSockets(id);
  } catch (err) {
    console.error(`Failed to disconnect sockets for manually ended room ${id}:`, err);
  }

  return {
    id: updated.id,
    name: updated.name,
    status: updated.status,
    endedAt: updated.endedAt.toISOString(),
    lastUpdated: updated.updatedAt.toISOString(),
    autoEnded: false,
  };
}

/**
 * Renames a room. Only the creator can do this.
 */
export async function renameRoom(roomId, userId, newName) {
  if (!newName || typeof newName !== "string" || newName.trim().length < 2) {
    throw new AppError("Room name must be at least 2 characters.", 400);
  }
  if (newName.trim().length > 50) {
    throw new AppError("Room name cannot exceed 50 characters.", 400);
  }

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) throw new AppError("Room not found.", 404);
  if (room.createdById !== userId) {
    throw new AppError("Only the room creator can rename this room.", 403);
  }

  const updated = await prisma.room.update({
    where: { id: roomId },
    data: { 
      name: newName.trim(),
      lastActivityAt: new Date(),
    },
  });

  return {
    id: updated.id,
    name: updated.name,
    lastUpdated: updated.updatedAt.toISOString(),
  };
}

/**
 * Permanently deletes a room and all its participants.
 * Only the creator can do this.
 */
export async function deleteRoom(roomId, userId) {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) throw new AppError("Room not found.", 404);
  if (room.createdById !== userId) {
    throw new AppError("Only the room creator can delete this room.", 403);
  }

  // Transaction: delete participants first, then room
  await prisma.$transaction([
    prisma.roomParticipant.deleteMany({ where: { roomId } }),
    prisma.room.delete({ where: { id: roomId } }),
  ]);
}

/**
 * Updates lastActivityAt timestamp. Called from socket events.
 */
export async function touchRoom(roomId) {
  try {
    await prisma.room.update({
      where: { id: roomId },
      data: { lastActivityAt: new Date() },
    });
  } catch {
    // Room may not exist in DB yet — silently ignore
  }
}

/**
 * Helper to check if a room is stale and expire it lazily.
 */
export async function checkAndExpireRoom(room) {
  if (room.status === "ACTIVE") {
    const elapsed = Date.now() - new Date(room.lastActivityAt).getTime();
    const threeHours = 3 * 60 * 60 * 1000;
    if (elapsed > threeHours) {
      await expireRoom(room.id);
      throw new AppError("This room has expired due to inactivity.", 410);
    }
  } else if (room.status === "ENDED") {
    if (room.endedAt && room.lastActivityAt) {
      const diff = new Date(room.endedAt).getTime() - new Date(room.lastActivityAt).getTime();
      if (diff >= 3 * 60 * 60 * 1000 - 10000) {
        throw new AppError("This room has expired due to inactivity.", 410);
      }
    }
  }
}

/**
 * Expires a specific room. Marks status as ENDED and disconnects sockets.
 */
export async function expireRoom(roomId) {
  const updated = await prisma.room.update({
    where: { id: roomId },
    data: {
      status: "ENDED",
      endedAt: new Date(),
    },
  });

  try {
    const { disconnectRoomSockets } = await import("../../sockets/index.js");
    disconnectRoomSockets(roomId);
  } catch (err) {
    console.error(`Failed to disconnect sockets for expired room ${roomId}:`, err);
  }

  return updated;
}

/**
 * Scans for active rooms with no activity in the last 3 hours and expires them.
 */
export async function expireStaleRooms() {
  const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
  try {
    const staleRooms = await prisma.room.findMany({
      where: {
        status: "ACTIVE",
        lastActivityAt: {
          lt: threeHoursAgo,
        },
      },
    });

    for (const room of staleRooms) {
      try {
        await expireRoom(room.id);
        console.log(`[auto-expiry] Room ${room.id} (${room.name}) expired due to inactivity.`);
      } catch (err) {
        console.error(`[auto-expiry] Failed to expire room ${room.id}:`, err);
      }
    }
  } catch (err) {
    console.error("[auto-expiry] Background scan query failed:", err);
  }
}
