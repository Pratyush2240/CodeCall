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

/**
 * Protected Routes
 */
router.post("/logout", requireAuth, logout);

export default router;
