import { verifyAccessToken } from "../utils/jwt.js";
import prisma from "../config/prisma.js";
import AppError from "../utils/appError.js";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Authorization token missing", 401));
    }

    const token = authHeader.split(" ")[1];

    let payload;

    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      return next(new AppError("Invalid or expired token", 401));
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user) {
      return next(new AppError("User no longer exists", 401));
    }

    req.user = {
      id: user.id,
      role: user.role
    };

    next();

  } catch (error) {
    next(error); // let global error handler decide
  }
};