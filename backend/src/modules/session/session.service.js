import prisma from "../../config/prisma.js";

/**
 * Create Session
 */
export const createSession = async (hostId) => {
  return prisma.session.create({
    data: { hostId }
  });
};

/**
 * Join Session
 */
export const joinSession = async (sessionId, userId) => {
  const session = await prisma.session.findUnique({
    where: { id: sessionId }
  });

  if (!session) {
    throw { statusCode: 404, message: "Session not found" };
  }

  if (session.hostId === userId) {
    throw { statusCode: 400, message: "Host cannot join as guest" };
  }

  if (session.guestId) {
    throw { statusCode: 400, message: "Session already joined" };
  }

  return prisma.session.update({
    where: { id: sessionId },
    data: {
      guestId: userId,
      status: "ACTIVE"
    }
  });
};

/**
 * End Session
 */
export const endSession = async (sessionId, userId) => {
  const session = await prisma.session.findUnique({
    where: { id: sessionId }
  });

  if (!session || session.hostId !== userId) {
    throw { statusCode: 403, message: "Only host can end session" };
  }

  return prisma.session.update({
    where: { id: sessionId },
    data: {
      status: "ENDED",
      endedAt: new Date()
    }
  });
};
