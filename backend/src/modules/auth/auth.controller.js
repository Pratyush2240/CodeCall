import {
  registerUser,
  loginUser,
  refreshUserToken,
  logoutUser
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
      data: user
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
 * REFRESH TOKEN (ROTATION ENABLED)
 * POST /api/auth/refresh
 */
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const tokens = await refreshUserToken(refreshToken);

    res.status(200).json({
      success: true,
      ...tokens
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
    const userId = req.user?.id; // requires requireAuth middleware

    const result = await logoutUser(userId);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};
