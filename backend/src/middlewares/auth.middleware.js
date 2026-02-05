import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Authentication Middleware
 * -------------------------
 * Verifies JWT access token and attaches decoded user payload to req.user
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Check for Authorization header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token missing",
    });
  }

  // 2. Extract token
  const token = authHeader.split(" ")[1];

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

    // 4. Attach user payload to request
    req.user = decoded;

    next();
  } catch (error) {
    // 5. Handle JWT errors precisely
    return res.status(401).json({
      success: false,
      message:
        error.name === "TokenExpiredError"
          ? "Access token expired"
          : "Invalid access token",
    });
  }
};
