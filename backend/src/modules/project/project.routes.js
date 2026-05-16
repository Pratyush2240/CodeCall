import { Router } from "express";
import {
  listProjects,
  getProject,
  createProjectHandler,
  updateProjectHandler,
  deleteProjectHandler,
} from "./project.controller.js";
import { requireAuth } from "../../middlewares/requireAuth.js";

const router = Router();

/* All project routes require authentication */
router.use(requireAuth);

/** GET  /api/projects          — list user's projects */
router.get("/", listProjects);

/** POST /api/projects          — create a project */
router.post("/", createProjectHandler);

/** GET  /api/projects/:id      — get single project with rooms */
router.get("/:id", getProject);

/** PATCH /api/projects/:id     — update project (owner only) */
router.patch("/:id", updateProjectHandler);

/** DELETE /api/projects/:id    — delete project (owner only) */
router.delete("/:id", deleteProjectHandler);

export default router;
