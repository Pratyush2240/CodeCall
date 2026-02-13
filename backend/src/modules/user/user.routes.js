console.log("USER ROUTES LOADED");

import express from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";

const router = express.Router();

router.get("/me", requireAuth, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user
  });
});

export default router;
