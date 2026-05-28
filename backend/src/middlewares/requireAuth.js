import { verifyAccessToken } from "../utils/jwt.js";
import prisma from "../config/prisma.js";
import AppError from "../utils/appError.js";
import { ERROR_CODES } from "../constants/errorCodes.js";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Missing or malformed header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        new AppError(
          "Authorization token missing",
          401,
          ERROR_CODES.AUTH_MISSING_TOKEN
        )
      );
    }

    const token = authHeader.split(" ")[1];

    let payload;

    // 2️⃣ Invalid or expired token
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      return next(
        new AppError(
          "Invalid or expired token",
          401,
          ERROR_CODES.AUTH_INVALID_TOKEN
        )
      );
    }

    // 3️⃣ Check user existence
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user) {
      return next(
        new AppError(
          "User no longer exists",
          401,
          ERROR_CODES.AUTH_USER_NOT_FOUND
        )
      );
    }

    // 4️⃣ Attach user to request
    req.user = {
      id: user.id,
      role: user.role,
      isProfileComplete: user.isProfileComplete,
      isOAuthUser: user.isOAuthUser,
    };

    next();

  } catch (error) {
    // 5️⃣ Unexpected system error → let global handler manage
    next(error);
  }
};