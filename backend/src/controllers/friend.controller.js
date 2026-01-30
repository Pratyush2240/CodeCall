import {
  sendRequest,
  acceptRequest,
  listFriends
} from "../services/friend.service.js";
import { successResponse } from "../utils/response.js";

export const sendFriendRequest = async (req, res, next) => {
  try {
    const { receiverId } = req.body;
    const data = await sendRequest(req.user.userId, receiverId);
    successResponse(res, data, "Friend request sent");
  } catch (err) {
    next(err);
  }
};

export const acceptFriendRequest = async (req, res, next) => {
  try {
    const data = await acceptRequest(req.params.id, req.user.userId);
    successResponse(res, data, "Friend request accepted");
  } catch (err) {
    next(err);
  }
};

export const getFriends = async (req, res, next) => {
  try {
    const data = await listFriends(req.user.userId);
    successResponse(res, data);
  } catch (err) {
    next(err);
  }
};
