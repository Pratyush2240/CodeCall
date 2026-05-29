import {
  getUserProfile,
  getRecentCollaborators,
  updateUserProfile,
  changePassword,
} from "./user.service.js";
import catchAsync from "../../utils/catchAsync.js";

/**
 * GET /api/user/profile
 * Returns the authenticated user's profile.
 */
export const getProfile = catchAsync(async (req, res) => {
  const user = await getUserProfile(req.user.id);
  res.status(200).json({ status: "success", data: user });
});

/**
 * GET /api/user/recent-collaborators
 * Returns users who have shared a room with the current user.
 */
export const getCollaborators = catchAsync(async (req, res) => {
  const collaborators = await getRecentCollaborators(req.user.id);
  res.status(200).json({ status: "success", data: collaborators });
});

/**
 * PATCH /api/user/profile
 * Updates fullName and/or username.
 */
export const patchProfile = catchAsync(async (req, res) => {
  const { fullName, username } = req.body;
  const updated = await updateUserProfile(req.user.id, { fullName, username });
  res.status(200).json({ status: "success", data: updated });
});

/**
 * PATCH /api/user/change-password
 * Changes password (verifies current password first for existing-password accounts).
 */
export const patchPassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await changePassword(req.user.id, { currentPassword, newPassword });
  res.status(200).json({ status: "success", ...result });
});