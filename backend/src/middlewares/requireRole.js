import AppError from "../utils/appError.js";
import { ERROR_CODES } from "../constants/errorCodes.js";

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // User not authenticated
    if (!req.user) {
      return next(
        new AppError(
          "Unauthorized",
          401,
          ERROR_CODES.AUTH_MISSING_TOKEN
        )
      );
    }

    // Role not allowed
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          "Forbidden: Insufficient permissions",
          403,
          ERROR_CODES.AUTH_FORBIDDEN
        )
      );
    }

    next();
  };
};