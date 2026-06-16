import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import ConfirmModal from '../components/ConfirmModal';
import { getProjects, createProjectAPI, deleteProjectAPI, updateProjectAPI } from '../api/projects';
import './Projects.css';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  /* ── Rename project ── */
  const handleRename = async (projectId, newName) => {
    try {
      const updated = await updateProjectAPI(projectId, { name: newName });
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, name: updated.name } : p))
      );
    } catch (err) {
      alert(err?.response?.data?.message ?? 'Failed to rename project.');
      throw err;
    }
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
                  onRename={handleRename}
                  onDelete={(id) => {
                    const proj = projects.find((p) => p.id === id);
                    setDeleteTarget(proj);
                  }}
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

      {deleteTarget && (
        <ConfirmModal
          title="Delete Project?"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone and will permanently delete all rooms and data associated with this project.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          danger={true}
          loading={deleting}
          onConfirm={async () => {
            setDeleting(true);
            try {
              await deleteProjectAPI(deleteTarget.id);
              setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
              setDeleteTarget(null);
            } catch (err) {
              alert(err?.response?.data?.message ?? 'Failed to delete project.');
            } finally {
              setDeleting(false);
            }
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
