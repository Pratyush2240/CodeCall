import prisma from "../../config/prisma.js";

/**
 * Send friend request
 */
export const sendFriendRequest = async (requesterId, receiverId) => {
  if (requesterId === receiverId) {
    throw new Error("You cannot send a request to yourself");
  }

  const existing = await prisma.friend.findFirst({
    where: {
      requesterId,
      receiverId
    }
  });

  if (existing) {
    throw new Error("Friend request already exists");
  }

  const request = await prisma.friend.create({
    data: {
      requesterId,
      receiverId
    }
  });

  return request;
};

/**
 * Accept friend request
 */
export const acceptFriendRequest = async (requestId) => {
  const updated = await prisma.friend.update({
    where: { id: requestId },
    data: { status: "ACCEPTED" }
  });

  return updated;
};

/**
 * Get my friends
 */
export const getMyFriends = async (userId) => {
  return prisma.friend.findMany({
    where: {
      OR: [
        { requesterId: userId },
        { receiverId: userId }
      ],
      status: "ACCEPTED"
    }
  });
};
