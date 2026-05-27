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

/**
 * ─── GitHub OAuth ───────────────────────────────────────────────────────────
 * GET /api/auth/github          → Redirect user to GitHub consent screen
 * GET /api/auth/github/callback → GitHub redirects back here with auth code
 */
router.get(
  "/github",
  passport.authenticate("github", { session: false, scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=oauth_failed`,
  }),
  githubCallback
);

/**
 * ─── Google OAuth ───────────────────────────────────────────────────────────
 * GET /api/auth/google          → Redirect user to Google consent screen
 * GET /api/auth/google/callback → Google redirects back here with auth code
 */
router.get(
  "/google",
  passport.authenticate("google", { session: false, scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=oauth_failed`,
  }),
  googleCallback
);

export default router;
