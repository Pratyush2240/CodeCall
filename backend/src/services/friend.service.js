import { prisma } from "../config/prisma.js";

export const sendRequest = async (requesterId, receiverId) => {
  if (requesterId === receiverId) {
    throw { statusCode: 400, message: "Cannot send request to yourself" };
  }

  return prisma.friend.create({
    data: {
      requesterId,
      receiverId
    }
  });
};

export const acceptRequest = async (requestId, userId) => {
  const request = await prisma.friend.findUnique({
    where: { id: requestId }
  });

  if (!request || request.receiverId !== userId) {
    throw { statusCode: 403, message: "Unauthorized" };
  }

  return prisma.friend.update({
    where: { id: requestId },
    data: { status: "ACCEPTED" }
  });
};

export const listFriends = async (userId) => {
  return prisma.friend.findMany({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: userId },
        { receiverId: userId }
      ]
    }
  });
};
