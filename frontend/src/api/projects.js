import API from "./axios";

/**
 * GET /projects
 * Fetches all projects for the current user.
 */
export async function getProjects() {
  const { data } = await API.get("/projects");
  return data;
}

/**
 * GET /projects/:id
 * Fetches a single project with its rooms and members.
 */
export async function getProject(id) {
  const { data } = await API.get(`/projects/${id}`);
  return data;
}

/**
 * POST /projects
 * Creates a new project.
 * @param {{ name: string, description?: string, tags?: string[] }} payload
 */
export async function createProjectAPI(payload) {
  const { data } = await API.post("/projects", payload);
  return data;
}

/**
 * PATCH /projects/:id
 * Updates a project (owner only).
 */
export async function updateProjectAPI(id, payload) {
  const { data } = await API.patch(`/projects/${id}`, payload);
  return data;
}

/**
 * DELETE /projects/:id
 * Deletes a project (owner only).
 */
export async function deleteProjectAPI(id) {
  const { data } = await API.delete(`/projects/${id}`);
  return data;
}
