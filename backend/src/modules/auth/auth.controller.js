import prisma from "../../config/prisma.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from "../../utils/jwt.js";
import {
  registerUser,
  loginUser
} from "./auth.service.js";

/**
 * REGISTER
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const user = await registerUser({ username, email, password });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * LOGIN
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { accessToken, refreshToken } = await loginUser({
      email,
      password
    });

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * REFRESH ACCESS TOKEN
 * POST /api/auth/refresh
 */
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token missing"
      });
    }

    const payload = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({
        message: "Invalid refresh token"
      });
    }

    const newAccessToken = generateAccessToken({
      userId: user.id,
      role: user.role
    });

    res.status(200).json({
      accessToken: newAccessToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * LOGOUT
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await prisma.user.updateMany({
        where: { refreshToken },
        data: { refreshToken: null }
      });
    }

    res.status(200).json({
      message: "Logged out successfully"
    });
  } catch (error) {
    next(error);
  }
};
