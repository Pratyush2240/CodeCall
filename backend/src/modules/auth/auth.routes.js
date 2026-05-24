import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  forgotPwd,
  resetPwd,
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
 * Public Routes
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
 * Protected Routes
 */
router.post("/logout", requireAuth, logout);

export default router;
