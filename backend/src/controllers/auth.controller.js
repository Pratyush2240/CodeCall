import { registerUser, loginUser } from "../services/auth.service.js";
import { successResponse } from "../utils/response.js";

export const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    successResponse(res, { id: user.id, email: user.email }, "User registered");
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const tokens = await loginUser(req.body);
    successResponse(res, tokens, "Login successful");
  } catch (err) {
    next(err);
  }
};
