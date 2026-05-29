console.log("USER ROUTES LOADED");

import express from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { requireRole } from "../../middlewares/requireRole.js";
import {
  getProfile,
  getCollaborators,
  patchProfile,
  patchPassword,
} from "./user.controller.js";

const router = express.Router();

// All user routes require authentication
router.use(requireAuth);

/**
 * GET /api/user/profile
 * Returns the current user's full profile.
 */
router.get("/profile", getProfile);

/**
 * PATCH /api/user/profile
 * Update fullName and/or username.
 */
router.patch("/profile", patchProfile);

/**
 * PATCH /api/user/change-password
 * Change or add a password.
 */
router.patch("/change-password", patchPassword);

/**
 * GET /api/user/recent-collaborators
 * Returns users who have shared a room with the current user.
 */
router.get("/recent-collaborators", getCollaborators);

/**
 * GET /api/user/admin-test
 */
router.get(
  "/admin-test",
  requireRole(["ADMIN"]),
  (req, res) => {
    res.json({ success: true, message: "Admin access granted" });
  }
);

export default router;
