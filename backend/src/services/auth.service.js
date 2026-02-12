import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";

import {
  generateAccessToken,
  generateRefreshToken
} from "../utils/jwt.js";

const SALT_ROUNDS = 10;

/**
 * Register a new user
 */
export const registerUser = async ({ name, email, password }) => {
  // 1. Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw {
      statusCode: 409,
      message: "Email already registered"
    };
  }

  // 2. Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // 3. Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash
    }
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
};

/**
 * Login user
 */
export const loginUser = async ({ email, password }) => {
  // 1. Find user
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw {
      statusCode: 401,
      message: "Invalid credentials"
    };
  }

  // 2. Verify password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw {
      statusCode: 401,
      message: "Invalid credentials"
    };
  }

  // 3. Generate tokens
  const payload = {
    userId: user.id,
    email: user.email
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};
