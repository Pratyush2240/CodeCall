import { Router } from "express";
import {
  createPracticeSession,
  joinPracticeSession,
  endPracticeSession
} from "../controllers/session.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authenticate, createPracticeSession);
router.post("/join/:id", authenticate, joinPracticeSession);
router.post("/end/:id", authenticate, endPracticeSession);

export default router;
