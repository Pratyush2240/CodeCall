import express from "express";
import { requireAuth } from "../../middlewares/requireAuth.js";

import {
  createPracticeSession,
  joinPracticeSession,
  endPracticeSession
} from "./session.controller.js";

const router = express.Router();

router.post("/", requireAuth, createPracticeSession);
router.post("/:id/join", requireAuth, joinPracticeSession);
router.post("/:id/end", requireAuth, endPracticeSession);

export default router;
