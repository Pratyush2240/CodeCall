import {
  createSession,
  joinSession,
  endSession
} from "./session.service.js";

import { successResponse } from "../../utils/response.js";

/**
 * Create Practice Session
 */
export const createPracticeSession = async (req, res, next) => {
  try {
    const data = await createSession(req.user.id);

    successResponse(res, data, "Session created");
  } catch (err) {
    next(err);
  }
};

/**
 * Join Practice Session
 */
export const joinPracticeSession = async (req, res, next) => {
  try {
    const data = await joinSession(req.params.id, req.user.id);

    successResponse(res, data, "Session joined");
  } catch (err) {
    next(err);
  }
};

/**
 * End Practice Session
 */
export const endPracticeSession = async (req, res, next) => {
  try {
    const data = await endSession(req.params.id, req.user.id);

    successResponse(res, data, "Session ended");
  } catch (err) {
    next(err);
  }
};
