import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RoomCard from '../components/RoomCard';
import ConfirmModal from '../components/ConfirmModal';
import { getProject } from '../api/projects';
import { createRoom, renameRoom, deleteRoom as deleteRoomApi } from '../api/rooms';
import './ProjectDetail.css';

/* ── Icons ── */
const RoomIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <polyline points="4 17 10 11 4 5" strokeWidth="2.5"/>
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const currentUserId = (() => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId ?? payload.id ?? payload.sub ?? null;
    } catch { return null; }
  })();

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProject(projectId);
      setProject(data);
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to load project.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  /* Create room inside this project */
  const handleCreateRoom = async () => {
    setCreating(true);
    try {
      const room = await createRoom(null, projectId);
      navigate(`/room/${room.id}`);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to create room.');
    } finally {
      setCreating(false);
    }
  };

  /* ── Rename Room ── */
  const handleRename = async (roomId, newName) => {
    try {
      await renameRoom(roomId, newName);
      setProject((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          rooms: prev.rooms.map((r) => (r.id === roomId ? { ...r, name: newName } : r)),
        };
      });
    } catch (err) {
      alert(err?.response?.data?.message ?? 'Failed to rename room.');
    }
  };

  /* ── Delete Room ── */
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRoomApi(deleteTarget);
      setProject((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          rooms: prev.rooms.filter((r) => r.id !== deleteTarget),
        };
      });
    } catch (err) {
      alert(err?.response?.data?.message ?? 'Failed to delete room.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const activeRooms = project?.rooms?.filter((r) => r.status === 'ACTIVE') || [];
  const endedRooms = project?.rooms?.filter((r) => r.status === 'ENDED') || [];

  return (
    <div className="pd-shell">
      <Navbar activePage="projects" />

      <div className="pd-body">
        <main className="pd-main">
          {/* Back */}
          <button className="pd-back" onClick={() => navigate('/projects')}>
            <BackIcon /> Back to Projects
          </button>

          {loading && (
            <div className="pd-state">
              <div className="spinner" />
              <span>Loading project…</span>
            </div>
          )}

          {error && !loading && (
            <div className="pd-state pd-state--error" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && project && (
            <>
              {/* ── Header ── */}
              <div className="pd-header">
                <div className="pd-header-left">
                  <h1 className="pd-title">{project.name}</h1>
                  {project.description && (
                    <p className="pd-desc">{project.description}</p>
                  )}
                  {project.tags?.length > 0 && (
                    <div className="pd-tags">
                      {project.tags.map((t) => (
                        <span key={t} className="pd-tag">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className="pd-create-room-btn"
                  onClick={handleCreateRoom}
                  disabled={creating}
                >
                  <PlusIcon />
                  {creating ? 'Creating…' : 'New Room'}
                </button>
              </div>

              {/* ── Stats ── */}
              <div className="pd-stats">
                <div className="pd-stat-card">
                  <span className="pd-stat-value">{project.rooms?.length || 0}</span>
                  <span className="pd-stat-label">Total Rooms</span>
                </div>
                <div className="pd-stat-card">
                  <span className="pd-stat-value">{activeRooms.length}</span>
                  <span className="pd-stat-label">Active</span>
                </div>
                <div className="pd-stat-card">
                  <span className="pd-stat-value">{project.members?.length || 0}</span>
                  <span className="pd-stat-label">Members</span>
                </div>
                <div className="pd-stat-card">
                  <span className="pd-stat-value">
                    {project.rooms?.length > 0
                      ? timeAgo(project.rooms[0]?.lastActivity)
                      : '—'}
                  </span>
                  <span className="pd-stat-label">Last Activity</span>
                </div>
              </div>

              {/* ── Active Rooms ── */}
              <section className="pd-section">
                <h2 className="pd-section-title">
                  Active Rooms
                  <span className="pd-section-count">{activeRooms.length}</span>
                </h2>

                {activeRooms.length === 0 && (
                  <div className="pd-empty-rooms">
                    No active rooms. Create one to start collaborating.
                  </div>
                )}

                <div className="pd-room-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeRooms.map((room, idx) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      index={idx}
                      isOwner={room.createdBy === currentUserId}
                      onRename={handleRename}
                      onDelete={(id) => setDeleteTarget(id)}
                    />
                  ))}
                </div>
              </section>

              {/* ── Ended Rooms ── */}
              {endedRooms.length > 0 && (
                <section className="pd-section">
                  <h2 className="pd-section-title">
                    Previous Rooms
                    <span className="pd-section-count">{endedRooms.length}</span>
                  </h2>
                  <div className="pd-room-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {endedRooms.map((room, idx) => (
                      <RoomCard
                        key={room.id}
                        room={room}
                        index={idx}
                        isOwner={room.createdBy === currentUserId}
                        onRename={handleRename}
                        onDelete={(id) => setDeleteTarget(id)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* ── Members ── */}
              <section className="pd-section">
                <h2 className="pd-section-title">
                  Members
                  <span className="pd-section-count">{project.members?.length}</span>
                </h2>
                <div className="pd-member-list">
                  {project.members?.map((m) => (
                    <div key={m.id} className="pd-member">
                      <div className="pd-member-avatar">
                        {m.user.username[0].toUpperCase()}
                      </div>
                      <div className="pd-member-info">
                        <span className="pd-member-name">{m.user.username}</span>
                        <span className="pd-member-role">{m.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {deleteTarget && (
                <ConfirmModal
                  isOpen={!!deleteTarget}
                  title="Delete Room?"
                  message="Are you sure you want to permanently delete this room? This will disconnect all active sessions."
                  confirmLabel={deleting ? 'Deleting…' : 'Delete'}
                  onConfirm={handleDeleteConfirm}
                  onCancel={() => setDeleteTarget(null)}
                />
              )}
            </>
          )}
        </main>

        <Sidebar />
      </div>
    </div>
  );
}
