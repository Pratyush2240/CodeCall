import {
  getProjectsForUser,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "./project.service.js";
import AppError from "../../utils/appError.js";

/** GET /api/projects */
export async function listProjects(req, res, next) {
  try {
    const projects = await getProjectsForUser(req.user.id);
    res.json(projects);
  } catch (err) {
    next(err);
  }
}

/** GET /api/projects/:id */
export async function getProject(req, res, next) {
  try {
    const project = await getProjectById(req.params.id, req.user.id);
    res.json(project);
  } catch (err) {
    next(err);
  }
}

/** POST /api/projects */
export async function createProjectHandler(req, res, next) {
  try {
    const { name, description, tags } = req.body;
    if (!name || !name.trim()) {
      return next(new AppError("Project name is required.", 400));
    }
    const project = await createProject({ name, description, tags }, req.user.id);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/projects/:id */
export async function updateProjectHandler(req, res, next) {
  try {
    const { name, description, tags } = req.body;
    const project = await updateProject(req.params.id, { name, description, tags }, req.user.id);
    res.json(project);
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/projects/:id */
export async function deleteProjectHandler(req, res, next) {
  try {
    const result = await deleteProject(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
