import express from "express";
import { healthCheck, readinessCheck } from "./health.controller.js";

const router = express.Router();

router.get("/", healthCheck);
router.get("/ready", readinessCheck);

export default router;  