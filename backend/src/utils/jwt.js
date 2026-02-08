import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Generate short-lived access token
 * Used for authenticating API requests
 */
export const generateAccessToken = (payload) => {
  if (!env.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET is not defined");
  }

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES || "15m"
  });
};

/**
 * Generate long-lived refresh token
 * Used for issuing new access tokens
 */
export const generateRefreshToken = (payload) => {
  if (!env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not defined");
  }

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES || "7d"
  });
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token) => {
  if (!env.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET is not defined");
  }

  return jwt.verify(token, env.JWT_ACCESS_SECRET);
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
  if (!env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not defined");
  }

  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};
