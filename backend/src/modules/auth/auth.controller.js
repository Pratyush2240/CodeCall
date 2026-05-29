import {
  registerUser,
  loginUser,
  refreshUserToken,
  logoutUser,
  forgotPassword,
  resetPassword,
  oauthLogin,
  checkUsernameAvailability,
  completeUserProfile,
} from "./auth.service.js";

import { env } from "../../config/env.js";
import catchAsync from "../../utils/catchAsync.js";
import { getUserProfile } from "../user/user.service.js";
import { verifyAccessToken } from "../../utils/jwt.js";

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
  const { identifier, password } = req.body;

  const { accessToken, refreshToken } = await loginUser({
    identifier,
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

/**
 * GITHUB OAUTH CALLBACK
 * Called by Passport after it has resolved the GitHub user.
 * Generates JWT tokens and redirects to the frontend OAuthCallback page.
 */
export const githubCallback = async (req, res) => {
  try {
    const clientUrl = env.CLIENT_URL || "http://localhost:5173";
    const state = req.query?.state;
    if (state) {
      try {
        const payload = verifyAccessToken(state);
        if (payload.userId) {
          return res.redirect(`${clientUrl}/settings?connected=github`);
        }
      } catch (err) {
        console.error("[OAuth] Invalid linking state on callback:", err.message);
      }
    }

    const { accessToken, refreshToken } = await oauthLogin(req.user);
    return res.redirect(
      `${clientUrl}/oauth/callback?token=${encodeURIComponent(accessToken)}&refresh=${encodeURIComponent(refreshToken)}`
    );
  } catch (err) {
    console.error("[OAuth] GitHub callback error:", err.message);
    const clientUrl = env.CLIENT_URL || "http://localhost:5173";
    return res.redirect(`${clientUrl}/login?error=oauth_failed`);
  }
};

/**
 * GOOGLE OAUTH CALLBACK
 * Called by Passport after it has resolved the Google user.
 * Generates JWT tokens and redirects to the frontend OAuthCallback page.
 */
export const googleCallback = async (req, res) => {
  try {
    const clientUrl = env.CLIENT_URL || "http://localhost:5173";
    const state = req.query?.state;
    if (state) {
      try {
        const payload = verifyAccessToken(state);
        if (payload.userId) {
          return res.redirect(`${clientUrl}/settings?connected=google`);
        }
      } catch (err) {
        console.error("[OAuth] Invalid linking state on callback:", err.message);
      }
    }

    const { accessToken, refreshToken } = await oauthLogin(req.user);
    return res.redirect(
      `${clientUrl}/oauth/callback?token=${encodeURIComponent(accessToken)}&refresh=${encodeURIComponent(refreshToken)}`
    );
  } catch (err) {
    console.error("[OAuth] Google callback error:", err.message);
    const clientUrl = env.CLIENT_URL || "http://localhost:5173";
    return res.redirect(`${clientUrl}/login?error=oauth_failed`);
  }
};

/**
 * GET ME
 */
export const getMe = catchAsync(async (req, res) => {
  const user = await getUserProfile(req.user.id);
  res.status(200).json({ status: "success", data: user });
});

/**
 * CHECK USERNAME AVAILABILITY
 */
export const checkUsername = catchAsync(async (req, res) => {
  const { username } = req.params;
  const available = await checkUsernameAvailability(username, req.user?.id);
  res.status(200).json({ status: "success", available });
});

/**
 * COMPLETE PROFILE (OAuth Onboarding)
 */
export const completeProfile = catchAsync(async (req, res) => {
  const result = await completeUserProfile(req.user.id, req.body);
  res.status(200).json({ status: "success", data: result });
});
