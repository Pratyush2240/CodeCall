import prisma from "../../config/prisma.js";
import { hashPassword, comparePassword } from "../../utils/hash.js";
import AppError from "../../utils/appError.js";

export const RESERVED_USERNAMES = new Set([
  "admin", "root", "support", "help", "api", "auth", "login", "logout",
  "signup", "register", "dashboard", "settings", "profile", "me", "user",
  "users", "codecall", "system", "null", "undefined", "anonymous", "guest",
]);

/**
 * GET current user profile (safe fields only)
 */
export const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
      avatar: true,
      isOAuthUser: true,
      provider: true,
      isProfileComplete: true,
      hasPassword: true,
      createdAt: true,
    },
  });

  if (!user) throw new AppError("User not found", 404);
  return user;
};

/**
 * GET recent collaborators for the current user.
 * Returns the most recent unique users who have shared a room with this user.
 *
 * Strategy:
 *   1. Find all roomIds the current user has participated in
 *   2. Find other participants of those rooms
 *   3. Deduplicate by user, order by most recent room activity
 */
export const getRecentCollaborators = async (userId, limit = 12) => {
  // Step 1: Get all rooms the current user is in
  const userRooms = await prisma.roomParticipant.findMany({
    where: { userId },
    select: { roomId: true },
  });

  if (userRooms.length === 0) return [];

  const roomIds = userRooms.map((r) => r.roomId);

  // Step 2: Get other participants from those rooms, ordered by room lastActivity
  const participants = await prisma.roomParticipant.findMany({
    where: {
      roomId: { in: roomIds },
      userId: { not: userId }, // exclude self
    },
    select: {
      userId: true,
      joinedAt: true,
      room: {
        select: { lastActivity: true },
      },
      user: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatar: true,
          isOAuthUser: true,
        },
      },
    },
    orderBy: {
      room: { lastActivity: "desc" },
    },
  });

  // Step 3: Deduplicate by userId (keep most recent occurrence)
  const seen = new Set();
  const unique = [];
  for (const p of participants) {
    if (!seen.has(p.userId)) {
      seen.add(p.userId);
      unique.push(p.user);
    }
    if (unique.length >= limit) break;
  }

  return unique;
};

/**
 * PATCH user profile — update fullName and/or username
 */
export const updateUserProfile = async (userId, { fullName, username }) => {
  const normUsername = username?.toLowerCase().trim();

  if (normUsername) {
    if (RESERVED_USERNAMES.has(normUsername)) {
      throw new AppError("This username is reserved.", 400);
    }

    // Check uniqueness — exclude current user
    const conflict = await prisma.user.findFirst({
      where: {
        username: { equals: normUsername, mode: "insensitive" },
        NOT: { id: userId },
      },
    });

    if (conflict) {
      throw new AppError("This username is already taken.", 400);
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(fullName !== undefined && { fullName: fullName?.trim() || null }),
      ...(normUsername && { username: normUsername }),
    },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
      avatar: true,
      isOAuthUser: true,
      provider: true,
      isProfileComplete: true,
      hasPassword: true,
    },
  });

  return updated;
};

/**
 * PATCH change password
 * Requires current password for verification (security gate).
 * OAuth-only users (no password) pass currentPassword as null/undefined and
 * we skip the verification step — they're "adding" a password for the first time.
 */
export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404);

  if (user.hasPassword) {
    // Existing password — verify before allowing change
    if (!currentPassword) {
      throw new AppError("Current password is required.", 400);
    }
    const valid = await comparePassword(currentPassword, user.password);
    if (!valid) {
      throw new AppError("Current password is incorrect.", 400);
    }
  }

  const hashed = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed, hasPassword: true },
  });

  return { message: "Password updated successfully." };
};

/**
 * DELETE user account
 * Requires password if the user has a password configured.
 * Cleans up all related connections and cascades.
 */
export const deleteUserAccount = async (userId, password) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404);

  // If this user has a password set, verify it first before deletion
  if (user.hasPassword) {
    if (!password) {
      throw new AppError("Password is required to delete your account.", 400);
    }
    const valid = await comparePassword(password, user.password);
    if (!valid) {
      throw new AppError("Incorrect password.", 400);
    }
  }

  // Cascading cleanup of dependencies in order of reference
  await prisma.$transaction([
    // Delete Friends
    prisma.friend.deleteMany({
      where: {
        OR: [
          { requesterId: userId },
          { receiverId: userId }
        ]
      }
    }),

    // Delete Sessions
    prisma.session.deleteMany({
      where: {
        OR: [
          { hostId: userId },
          { guestId: userId }
        ]
      }
    }),

    // Delete Project Memberships of projects owned by this user
    prisma.projectMember.deleteMany({
      where: {
        project: { ownerId: userId }
      }
    }),

    // Delete Projects owned by this user
    prisma.project.deleteMany({
      where: { ownerId: userId }
    }),

    // Delete Room Participants of rooms created by this user
    prisma.roomParticipant.deleteMany({
      where: {
        room: { createdById: userId }
      }
    }),

    // Delete Rooms created by this user
    prisma.room.deleteMany({
      where: { createdById: userId }
    }),

    // Finally, delete the User
    prisma.user.delete({
      where: { id: userId }
    })
  ]);

  return { message: "Account deleted successfully." };
};
