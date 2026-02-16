import {
  registerUser,
  loginUser,
  refreshUserToken,
  logoutUser
} from "./auth.service.js";

import catchAsync from "../../utils/catchAsync.js";

/**
 * REGISTER
 */
export const register = catchAsync(async (req, res) => {
  const result = await registerUser(req.body);

  res.status(201).json({
    status: "success",
    data: result,
  });
});

/**
 * LOGIN
 */
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const { accessToken, refreshToken } = await loginUser({
    email,
    password,
  });

  res.status(200).json({
    status: "success",
    accessToken,
    refreshToken,
  });
});

/**
 * REFRESH
 */
export const refresh = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  const tokens = await refreshUserToken(refreshToken);

  res.status(200).json({
    status: "success",
    ...tokens,
  });
});

/**
 * LOGOUT
 */
export const logout = catchAsync(async (req, res) => {
  const userId = req.user?.id;

  const result = await logoutUser(userId);

  res.status(200).json({
    status: "success",
    ...result,
  });
});
