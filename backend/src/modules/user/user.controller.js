import {
  getUserProfile,
  getRecentCollaborators,
  updateUserProfile,
  changePassword,
  deleteUserAccount,
  searchUsers,
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

/**
 * DELETE /api/user/delete-account
 * Deletes the user account permanently (requires password verification if hasPassword = true).
 */
export const deleteAccount = catchAsync(async (req, res) => {
  const { password } = req.body;
  const result = await deleteUserAccount(req.user.id, password);
  res.status(200).json({ status: "success", ...result });
});

/**
 * GET /api/user/search?q=...
 * Search registered users by username or email.
 */
export const searchUsersHandler = catchAsync(async (req, res) => {
  const query = req.query.q;
  const results = await searchUsers(query, req.user.id);
  res.status(200).json({ status: "success", data: results });
});