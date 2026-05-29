import { Router } from "express";
import passport from "passport";
import {
  register,
  login,
  refresh,
  logout,
  forgotPwd,
  resetPwd,
  githubCallback,
  googleCallback,
  getMe,
  checkUsername,
  completeProfile,
} from "./auth.controller.js";

import { requireAuth } from "../../middlewares/requireAuth.js";
import validate from "../../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validation.js";
import { authLimiter } from "../../middlewares/rateLimiter.js";

const router = Router();

/**
 * ─── Public Routes (Email / Password) ──────────────────────────────────────
 */
router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  register
);

router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  login
);

router.post("/refresh", refresh);

router.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordSchema),
  forgotPwd
);

router.post(
  "/reset-password",
  authLimiter,
  validate(resetPasswordSchema),
  resetPwd
);

/**
 * ─── Protected Routes ──────────────────────────────────────────────────────
 */
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, getMe);
router.get("/check-username/:username", requireAuth, checkUsername);
router.post("/complete-profile", requireAuth, completeProfile);

/**
 * ─── GitHub OAuth ───────────────────────────────────────────────────────────
 * GET /api/auth/github          → Redirect user to GitHub consent screen
 * GET /api/auth/github/callback → GitHub redirects back here with auth code
 */
router.get(
  "/github",
  (req, res, next) => {
    const { state } = req.query;
    passport.authenticate("github", {
      session: false,
      scope: ["user:email"],
      state: state
    })(req, res, next);
  }
);

router.get(
  "/github/callback",
  (req, res, next) => {
    const isLinking = !!req.query.state;
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const failureRedirect = isLinking
      ? `${clientUrl}/settings?error=already_connected`
      : `${clientUrl}/login?error=oauth_failed`;

    passport.authenticate("github", {
      session: false,
      failureRedirect
    })(req, res, next);
  },
  githubCallback
);

/**
 * ─── Google OAuth ───────────────────────────────────────────────────────────
 * GET /api/auth/google          → Redirect user to Google consent screen
 * GET /api/auth/google/callback → Google redirects back here with auth code
 */
router.get(
  "/google",
  (req, res, next) => {
    const { state } = req.query;
    passport.authenticate("google", {
      session: false,
      scope: ["profile", "email"],
      state: state
    })(req, res, next);
  }
);

router.get(
  "/google/callback",
  (req, res, next) => {
    const isLinking = !!req.query.state;
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const failureRedirect = isLinking
      ? `${clientUrl}/settings?error=already_connected`
      : `${clientUrl}/login?error=oauth_failed`;

    passport.authenticate("google", {
      session: false,
      failureRedirect
    })(req, res, next);
  },
  googleCallback
);

export default router;
