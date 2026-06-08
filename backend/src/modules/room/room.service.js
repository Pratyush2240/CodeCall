import prisma from "../../config/prisma.js";
import AppError from "../../utils/appError.js";

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
    orderBy: { lastActivity: "desc" },
  };
  if (limit && Number.isInteger(limit) && limit > 0) {
    query.take = limit;
  }

  const rooms = await prisma.room.findMany(query);

  return rooms.map((r) => ({
    id: r.id,
    name: r.name,
    code: r.code,
    status: r.status,
    createdBy: r.createdById,
    createdByName: r.createdBy.username,
    participants: r._count.participants,
    projectId: r.projectId,
    lastUpdated: r.updatedAt.toISOString(),
    lastActivity: r.lastActivity.toISOString(),
    createdAt: r.createdAt.toISOString(),
    endedAt: r.endedAt?.toISOString() || null,
  }));
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
    lastActivity: room.lastActivity.toISOString(),
    createdAt: room.createdAt.toISOString(),
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
    data: { lastActivity: new Date() },
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
    lastActivity: updated.lastActivity.toISOString(),
    createdAt: updated.createdAt.toISOString(),
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
      participants: { select: { userId: true } },
    },
  });

  if (!room) throw new AppError("Room not found.", 404);

  // Block re-entry to ended rooms
  if (room.status === "ENDED") {
    throw new AppError("This room has ended and can no longer be joined.", 410);
  }

  const isParticipant = room.participants.some((p) => p.userId === userId);
  if (!isParticipant) {
    throw new AppError("You are not a participant of this room.", 403);
  }

  return {
    id: room.id,
    name: room.name,
    code: room.code,
    status: room.status,
    createdBy: room.createdById,
    createdByName: room.createdBy.username,
    participants: room.participants.map((p) => p.userId),
    projectId: room.projectId,
    lastUpdated: room.updatedAt.toISOString(),
    lastActivity: room.lastActivity.toISOString(),
    createdAt: room.createdAt.toISOString(),
    endedAt: room.endedAt?.toISOString() || null,
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
      lastActivity: new Date(),
    },
  });

  return {
    id: updated.id,
    name: updated.name,
    status: updated.status,
    endedAt: updated.endedAt.toISOString(),
    lastUpdated: updated.updatedAt.toISOString(),
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
    data: { name: newName.trim() },
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
 * Updates lastActivity timestamp. Called from socket events.
 */
export async function touchRoom(roomId) {
  try {
    await prisma.room.update({
      where: { id: roomId },
      data: { lastActivity: new Date() },
    });
  } catch {
    // Room may not exist in DB yet — silently ignore
  }
}
