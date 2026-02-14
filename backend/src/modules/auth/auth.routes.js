import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout
} from "./auth.controller.js";
import { requireAuth } from "../../middlewares/requireAuth.js";

const router = Router();

/**
 * Public Routes
 */
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh); // uses refresh token from body


/**
 * Protected Routes
 */
router.post("/logout", requireAuth, logout);

export default router;
