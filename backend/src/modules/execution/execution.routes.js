import { Router } from "express";
import { runCode, getLanguages } from "./execution.controller.js";
import { requireAuth } from "../../middlewares/requireAuth.js";

const router = Router();

// Require authentication for all execution routes
router.use(requireAuth);

/** POST /api/execute — run code snippet */
router.post("/", runCode);

/** GET /api/execute/languages — list supported languages */
router.get("/languages", getLanguages);

export default router;
