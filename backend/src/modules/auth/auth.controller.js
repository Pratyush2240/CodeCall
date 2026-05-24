import {
  registerUser,
  loginUser,
  refreshUserToken,
  logoutUser,
  forgotPassword,
  resetPassword,
} from "./auth.service.js";

import catchAsync from "../../utils/catchAsync.js";

/**
 * REGISTER — auto-login on success
 */
export const register = catchAsync(async (req, res) => {
  const result = await registerUser(req.body);

  res.status(201).json({
    status: "success",
    data: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
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
  const { refreshToken } = req.body;

  const result = await logoutUser(refreshToken);

  res.status(200).json({
    status: "success",
    ...result,
  });
});

/**
 * FORGOT PASSWORD
 */
export const forgotPwd = catchAsync(async (req, res) => {
  const { email } = req.body;

  const result = await forgotPassword(email);

  res.status(200).json({
    status: "success",
    ...result,
  });
});

/**
 * RESET PASSWORD
 */
export const resetPwd = catchAsync(async (req, res) => {
  const { token, password } = req.body;

  const result = await resetPassword(token, password);

  res.status(200).json({
    status: "success",
    ...result,
  });
});
