import {
  createSession,
  joinSession,
  endSession
} from "../services/session.service.js";
import { successResponse } from "../utils/response.js";

export const createPracticeSession = async (req, res, next) => {
  try {
    const data = await createSession(req.user.userId);
    successResponse(res, data, "Session created");
  } catch (err) {
    next(err);
  }
};

export const joinPracticeSession = async (req, res, next) => {
  try {
    const data = await joinSession(req.params.id, req.user.userId);
    successResponse(res, data, "Session joined");
  } catch (err) {
    next(err);
  }
};

export const endPracticeSession = async (req, res, next) => {
  try {
    const data = await endSession(req.params.id, req.user.userId);
    successResponse(res, data, "Session ended");
  } catch (err) {
    next(err);
  }
};
