console.log("USER ROUTES LOADED");

import express from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";
import { requireRole } from "../../middlewares/requireRole.js";

const router = express.Router();

router.get("/me", requireAuth, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user
  });
});

router.get(
  "/admin-test",
  requireAuth,
  requireRole(["ADMIN"]),
  (req, res) => {
    res.json({
      success: true,
      message: "Admin access granted"
    });
  }
);


export default router;
