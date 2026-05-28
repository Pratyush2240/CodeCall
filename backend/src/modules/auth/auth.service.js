import prisma from "../../config/prisma.js";
import { hashPassword, comparePassword } from "../../utils/hash.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from "../../utils/jwt.js";
import AppError from "../../utils/appError.js";
import { sendResetEmail } from "../../utils/mailer.js";
import crypto from "crypto";

/**
 * Utility: Hash refresh token before storing
 */
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

/**
 * Utility: Normalise username — lowercase, strip invalid chars
 */
const normaliseUsername = (u) =>
  u.toLowerCase().trim();

// ─── Reserved usernames ───────────────────────────────────────────────────────
const RESERVED_USERNAMES = new Set([
  "admin", "root", "support", "help", "api", "auth", "login", "logout",
  "signup", "register", "dashboard", "settings", "profile", "me", "user",
  "users", "codecall", "system", "null", "undefined", "anonymous", "guest",
]);

/**
 * ================================
 * REGISTER USER
 * ================================
 * Email/password users are marked isProfileComplete: true immediately —
 * they already provided all required info during signup.
 */
export const registerUser = async ({ fullName, username, email, password }) => {
  const normUsername = normaliseUsername(username);

  if (RESERVED_USERNAMES.has(normUsername)) {
    throw new AppError("This username is reserved.", 400);
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username: { equals: normUsername, mode: "insensitive" } }
      ]
    }
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new AppError("An account with this email already exists.", 400);
    }
    throw new AppError("This username is already taken.", 400);
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      fullName: fullName?.trim() || null,
      username: normUsername,
      email,
      password: hashedPassword,
      isProfileComplete: true,  // email users complete signup in one step
      hasPassword: true,
    }
  });

  // Auto-login: generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role
  });

  const refreshToken = generateRefreshToken({
    userId: user.id
  });

  const hashedRefresh = hashToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashedRefresh,
      userId: user.id,
      expiresAt: new Date(
        Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRY_MS)
      )
    }
  });

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      isProfileComplete: user.isProfileComplete,
    },
    accessToken,
    refreshToken,
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

  // OAuth-only users have no password — direct them to OAuth login
  if (!user.password) {
    const provider = user.provider
      ? `${user.provider.charAt(0).toUpperCase() + user.provider.slice(1)}`
      : "OAuth";
    throw new AppError(
      `This account uses ${provider} to sign in. Please use the ${provider} login button.`,
      401
    );
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

  return {
    accessToken,
    refreshToken,
    isProfileComplete: user.isProfileComplete,
  };
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

  // Possible reuse attempt
  if (!storedToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      await prisma.refreshToken.deleteMany({
        where: { userId: payload.userId }
      });
    } catch (err) {
      throw new AppError("Invalid refresh token", 403);
    }
    throw new AppError("Refresh token reuse detected", 403);
  }

  if (storedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({
      where: { id: storedToken.id }
    });
    throw new AppError("Refresh token expired", 401);
  }

  const payload = verifyRefreshToken(refreshToken);

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

/**
 * ================================
 * FORGOT PASSWORD — generate reset token
 * ================================
 */
export const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user) {
    return { message: "If that email exists, a reset link has been sent." };
  }

  // Invalidate any existing tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  // Generate a secure random token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  await prisma.passwordResetToken.create({
    data: {
      token: tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    },
  });

  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${rawToken}`;

  // Send the email
  try {
    await sendResetEmail(email, resetUrl);
  } catch (err) {
    console.error("[mail] Failed to send reset email:", err.message);
  }

  return { message: "If that email exists, a reset link has been sent." };
};

/**
 * ================================
 * RESET PASSWORD — verify token & update
 * ================================
 */
export const resetPassword = async (token, newPassword) => {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const resetRecord = await prisma.passwordResetToken.findUnique({
    where: { token: tokenHash },
  });

  if (!resetRecord) {
    throw new AppError("Invalid or expired reset token.", 400);
  }

  if (resetRecord.used) {
    throw new AppError("This reset link has already been used.", 400);
  }

  if (resetRecord.expiresAt < new Date()) {
    await prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { used: true },
    });
    throw new AppError("This reset link has expired.", 400);
  }

  const hashedPassword = await hashPassword(newPassword);

  // Update password + mark token as used in a transaction
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetRecord.userId },
      data: { password: hashedPassword, hasPassword: true },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { used: true },
    }),
    // Revoke all refresh tokens so user must re-login
    prisma.refreshToken.deleteMany({
      where: { userId: resetRecord.userId },
    }),
  ]);

  return { message: "Password has been reset successfully." };
};

/**
 * ================================
 * OAUTH LOGIN — issue JWT for resolved OAuth user
 * ================================
 * Called after Passport has already resolved/created the user from the provider.
 * Returns isNewUser so the controller can redirect new users to /complete-profile.
 *
 * @param {object} user - Prisma User record resolved by Passport strategy
 * @returns {{ accessToken, refreshToken, isNewUser }}
 */
export const oauthLogin = async (user) => {
  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
  });

  const hashedToken = hashToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashedToken,
      userId: user.id,
      expiresAt: new Date(
        Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRY_MS)
      ),
    },
  });

  // isNewUser = user has not yet completed the onboarding profile step
  return {
    accessToken,
    refreshToken,
    isNewUser: !user.isProfileComplete,
  };
};

/**
 * ================================
 * GET ME — return current user profile
 * ================================
 */
export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
      avatar: true,
      isOAuthUser: true,
      provider: true,
      isProfileComplete: true,
      hasPassword: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

/**
 * ================================
 * CHECK USERNAME AVAILABILITY
 * ================================
 */
export const checkUsernameAvailable = async (username) => {
  const norm = normaliseUsername(username);

  // Format validation
  if (!/^[a-z0-9_]{3,30}$/.test(norm)) {
    return { available: false, reason: "Invalid format" };
  }

  if (RESERVED_USERNAMES.has(norm)) {
    return { available: false, reason: "Reserved username" };
  }

  const existing = await prisma.user.findFirst({
    where: { username: { equals: norm, mode: "insensitive" } },
  });

  return { available: !existing };
};

/**
 * ================================
 * COMPLETE PROFILE
 * ================================
 * Called during onboarding for OAuth users (or anyone with isProfileComplete: false).
 * Sets fullName, username, optional password, and marks profile complete.
 */
export const completeProfile = async (userId, { fullName, username, password }) => {
  const normUsername = normaliseUsername(username);

  if (RESERVED_USERNAMES.has(normUsername)) {
    throw new AppError("This username is reserved.", 400);
  }

  // Check uniqueness — exclude the current user
  const conflict = await prisma.user.findFirst({
    where: {
      username: { equals: normUsername, mode: "insensitive" },
      NOT: { id: userId },
    },
  });

  if (conflict) {
    throw new AppError("This username is already taken.", 400);
  }

  const updateData = {
    fullName: fullName?.trim() || null,
    username: normUsername,
    isProfileComplete: true,
  };

  // Optionally set password for OAuth users
  if (password) {
    updateData.password = await hashPassword(password);
    updateData.hasPassword = true;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
      avatar: true,
      isOAuthUser: true,
      isProfileComplete: true,
      hasPassword: true,
    },
  });

  return updated;
};