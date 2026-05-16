import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import { getProjects, createProjectAPI, deleteProjectAPI } from '../api/projects';
import './Projects.css';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  /* ── Fetch projects on mount ── */
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  /* ── Create project ── */
  const handleCreate = async (payload) => {
    const project = await createProjectAPI(payload);
    setProjects((prev) => [project, ...prev]);
  };

  /* ── Delete project ── */
  const handleDelete = async (id) => {
    await deleteProjectAPI(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  /* ── Navigate to project detail ── */
  const handleOpen = (id) => navigate(`/projects/${id}`);

  return (
    <div className="projects-shell">
      <Navbar activePage="projects" />

      <div className="projects-body">
        <main className="projects-main">
          <div className="projects-header-row">
            <div className="projects-heading">
              <h1 className="projects-title">Projects</h1>
              <p className="projects-desc">
                Manage your collaborative workspaces and development workflows.
              </p>
            </div>
            <button className="btn-new-project" onClick={() => setModalOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Project
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="projects-state">
              <div className="spinner" />
              <span>Loading projects…</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="projects-state projects-state--error" role="alert">
              {error}
              <button className="projects-retry" onClick={fetchProjects}>Retry</button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && projects.length === 0 && (
            <div className="projects-empty">
              <div className="projects-empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                  stroke="var(--color-text-muted)" strokeWidth="1.2" strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="projects-empty-title">No projects yet</h3>
              <p className="projects-empty-sub">Create your first project to get started.</p>
              <button className="btn-new-project" onClick={() => setModalOpen(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Project
              </button>
            </div>
          )}

          {/* Project grid */}
          {!loading && !error && projects.length > 0 && (
            <div className="projects-grid-dynamic">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => handleOpen(project.id)}
                  onDelete={() => handleDelete(project.id)}
                />
              ))}
              {/* Add new card */}
              <ProjectCard empty onClick={() => setModalOpen(true)} />
            </div>
          )}
        </main>

        <Sidebar />
      </div>

      <CreateProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
