import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout
} from "./auth.controller.js";

import { requireAuth } from "../../middlewares/requireAuth.js";
import validate from "../../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "./auth.validation.js";
import { authLimiter } from "../../middlewares/rateLimiter.js";

const router = Router();

/**
 * Public Routes
 */
router.post(
  "/register",
  validate(registerSchema),
  register
);

router.post(
  "/login",
  validate(loginSchema),
  login
);

router.post("/refresh", refresh);

router.post("/login", authLimiter, login);
router.post("/register", authLimiter, register);

/**
 * Protected Routes
 */
router.post("/logout", requireAuth, logout);

export default router;
