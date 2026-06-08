import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import {
  getMyInvites,
  acceptInvite,
  declineInvite,
  revokeInvite,
} from "./invitation.controller.js";

const router = Router();

// All invitation routes require authentication
router.use(requireAuth);

/**
 * GET /api/invitations
 * Get pending invitations for the current user.
 */
router.get("/", getMyInvites);

/**
 * PATCH /api/invitations/:id/accept
 * Accept a room invitation.
 */
router.patch("/:id/accept", acceptInvite);

/**
 * PATCH /api/invitations/:id/decline
 * Decline a room invitation.
 */
router.patch("/:id/decline", declineInvite);

/**
 * DELETE /api/invitations/:id
 * Revoke/cancel a pending invitation.
 */
router.delete("/:id", revokeInvite);

export default router;
