import prisma from "../../config/prisma.js";
import { hashPassword, comparePassword } from "../../utils/hash.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from "../../utils/jwt.js";

/**
 * Register User
 */
export const registerUser = async ({ username, email, password }) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }]
    }
  });

  if (existingUser) {
    throw { statusCode: 409, message: "User already exists" };
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
 * Login User
 */
export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw { statusCode: 401, message: "Invalid credentials" };
  }

  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw { statusCode: 401, message: "Invalid credentials" };
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role
  });

  const refreshToken = generateRefreshToken({
    userId: user.id
  });

  // Store refresh token in DB
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken }
  });

  return { accessToken, refreshToken };
};


/**
 * Refresh Token (WITH ROTATION)
 */
export const refreshUserToken = async (refreshToken) => {
  if (!refreshToken) {
    throw { statusCode: 401, message: "Refresh token missing" };
  }

  // 1️⃣ Verify refresh token signature
  const payload = verifyRefreshToken(refreshToken);

  // 2️⃣ Fetch user
  const user = await prisma.user.findUnique({
    where: { id: payload.userId }
  });

  if (!user) {
    throw { statusCode: 403, message: "Invalid refresh token" };
  }

  // 3️⃣ Match refresh token stored in DB
  if (user.refreshToken !== refreshToken) {
    throw { statusCode: 403, message: "Refresh token mismatch" };
  }

  // 4️⃣ Generate new tokens (ROTATION)
  const newAccessToken = generateAccessToken({
    userId: user.id,
    role: user.role
  });

  const newRefreshToken = generateRefreshToken({
    userId: user.id
  });

  // 5️⃣ Replace refresh token in DB
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: newRefreshToken }
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
};


/**
 * Logout (Invalidate Refresh Token)
 */
export const logoutUser = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null }
  });

  return { message: "Logged out successfully" };
};
