import {
  registerUser,
  loginUser,
  refreshUserToken,
  logoutUser,
  forgotPassword,
  resetPassword,
  oauthLogin,
  getMe,
  checkUsernameAvailable,
  completeProfile,
} from "./auth.service.js";

import { env } from "../../config/env.js";
import catchAsync from "../../utils/catchAsync.js";

/**
 * REGISTER — auto-login on success
 * Email/password users are marked isProfileComplete: true → redirect to /dashboard
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
 * Returns isProfileComplete so the frontend knows where to redirect.
 */
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const { accessToken, refreshToken, isProfileComplete } = await loginUser({
    email,
    password,
  });

  res.status(200).json({
    status: "success",
    accessToken,
    refreshToken,
    isProfileComplete,
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

/**
 * GET ME
 * Returns the authenticated user's profile including isProfileComplete.
 */
export const getMeCtrl = catchAsync(async (req, res) => {
  const user = await getMe(req.user.id);

  res.status(200).json({
    status: "success",
    data: user,
  });
});

/**
 * CHECK USERNAME
 * GET /auth/check-username/:username
 * Returns { available: boolean }
 */
export const checkUsernameCtrl = catchAsync(async (req, res) => {
  const result = await checkUsernameAvailable(req.params.username);

  res.status(200).json({
    status: "success",
    ...result,
  });
});

/**
 * COMPLETE PROFILE
 * POST /auth/complete-profile
 * Finalises onboarding for OAuth (and any incomplete) users.
 */
export const completeProfileCtrl = catchAsync(async (req, res) => {
  const { fullName, username, password } = req.body;

  const user = await completeProfile(req.user.id, { fullName, username, password });

  res.status(200).json({
    status: "success",
    data: user,
  });
});

/**
 * GITHUB OAUTH CALLBACK
 * Redirects to /complete-profile for new users, /dashboard for returning users.
 */
export const githubCallback = async (req, res) => {
  try {
    const { accessToken, refreshToken, isNewUser } = await oauthLogin(req.user);
    const clientUrl = env.CLIENT_URL || "http://localhost:5173";
    const newParam = isNewUser ? "&new=1" : "";
    return res.redirect(
      `${clientUrl}/oauth/callback?token=${encodeURIComponent(accessToken)}&refresh=${encodeURIComponent(refreshToken)}${newParam}`
    );
  } catch (err) {
    console.error("[OAuth] GitHub callback error:", err.message);
    const clientUrl = env.CLIENT_URL || "http://localhost:5173";
    return res.redirect(`${clientUrl}/login?error=oauth_failed`);
  }
};

/**
 * GOOGLE OAUTH CALLBACK
 * Redirects to /complete-profile for new users, /dashboard for returning users.
 */
export const googleCallback = async (req, res) => {
  try {
    const { accessToken, refreshToken, isNewUser } = await oauthLogin(req.user);
    const clientUrl = env.CLIENT_URL || "http://localhost:5173";
    const newParam = isNewUser ? "&new=1" : "";
    return res.redirect(
      `${clientUrl}/oauth/callback?token=${encodeURIComponent(accessToken)}&refresh=${encodeURIComponent(refreshToken)}${newParam}`
    );
  } catch (err) {
    console.error("[OAuth] Google callback error:", err.message);
    const clientUrl = env.CLIENT_URL || "http://localhost:5173";
    return res.redirect(`${clientUrl}/login?error=oauth_failed`);
  }
};
