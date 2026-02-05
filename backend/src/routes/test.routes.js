import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/protected", authenticate, (req, res) => {
  res.json({
    success: true,
    message: "Protected route accessed",
    user: req.user,
  });
});

export default router;
