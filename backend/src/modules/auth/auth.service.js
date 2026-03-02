import prisma from "../../config/prisma.js";
import { hashPassword, comparePassword } from "../../utils/hash.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from "../../utils/jwt.js";
import AppError from "../../utils/appError.js";
import crypto from "crypto";

/**
 * Utility: Hash refresh token before storing
 */
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

/**
 * ================================
 * REGISTER USER
 * ================================
 */
export const registerUser = async ({ username, email, password }) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }]
    }
  });

  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword
    }
  });

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  };
};

/**
 * ================================
 * LOGIN USER
 * ================================
 */
export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isValid = await comparePassword(password, user.password);

  if (!isValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role
  });

  const refreshToken = generateRefreshToken({
    userId: user.id
  });

  const hashedToken = hashToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashedToken,
      userId: user.id,
      expiresAt: new Date(
        Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRY_MS)
      )
    }
  });

  return { accessToken, refreshToken };
};

/**
 * ================================
 * REFRESH TOKEN (WITH ROTATION)
 * ================================
 */
export const refreshUserToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError("Refresh token missing", 401);
  }

  const hashedToken = hashToken(refreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashedToken }
  });

  // 🔎 Possible reuse attempt
  if (!storedToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);

      // Revoke all sessions of this user
      await prisma.refreshToken.deleteMany({
        where: { userId: payload.userId }
      });

    } catch (err) {
      throw new AppError("Invalid refresh token", 403);
    }

    throw new AppError("Refresh token reuse detected", 403);
  }

  // Expired token cleanup
  if (storedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({
      where: { id: storedToken.id }
    });

    throw new AppError("Refresh token expired", 401);
  }

  const payload = verifyRefreshToken(refreshToken);

  // ROTATION: delete old token
  await prisma.refreshToken.delete({
    where: { id: storedToken.id }
  });

  const newRefreshToken = generateRefreshToken({
    userId: payload.userId
  });

  const newHashedToken = hashToken(newRefreshToken);

  await prisma.refreshToken.create({
    data: {
      tokenHash: newHashedToken,
      userId: payload.userId,
      expiresAt: new Date(
        Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRY_MS)
      )
    }
  });

  const user = await prisma.user.findUnique({
    where: { id: payload.userId }
  });

  const newAccessToken = generateAccessToken({
    userId: user.id,
    role: user.role
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
};

/**
 * ================================
 * LOGOUT USER (Invalidate Session)
 * ================================
 */
export const logoutUser = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError("Refresh token missing", 400);
  }

  const hashedToken = hashToken(refreshToken);

  await prisma.refreshToken.deleteMany({
    where: { tokenHash: hashedToken }
  });

  return { message: "Logged out successfully" };
};