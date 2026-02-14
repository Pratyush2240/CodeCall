import {
  sendFriendRequest,
  acceptFriendRequest,
  getMyFriends
} from "./friend.service.js";

export const sendRequest = async (req, res, next) => {
  try {
    const { receiverId } = req.body;

    const request = await sendFriendRequest(
      req.user.id,
      receiverId
    );

    res.status(201).json({
      success: true,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

export const acceptRequest = async (req, res, next) => {
  try {
    const { requestId } = req.body;

    const updated = await acceptFriendRequest(requestId);

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const listFriends = async (req, res, next) => {
  try {
    const friends = await getMyFriends(req.user.id);

    res.json({
      success: true,
      data: friends
    });
  } catch (error) {
    next(error);
  }
};
