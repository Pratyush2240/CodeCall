import AppError from "../utils/appError.js";

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError("Forbidden: Insufficient permissions", 403)
      );
    }

    next();
  };
};