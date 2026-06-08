import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RoomCard from '../components/RoomCard';
import ConfirmModal from '../components/ConfirmModal';
import { getRooms, createRoom, renameRoom, deleteRoom as deleteRoomApi } from '../api/rooms';
import '../pages/Dashboard.css'; // Reuse dashboard layout classes

/* ── Icons ── */
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ animation: 'spin 0.8s linear infinite' }}>
    <path d="M21 12a9 9 0 11-6.219-8.56" />
  </svg>
);

export default function RoomsPage() {
  const navigate = useNavigate();

  const [rooms, setRooms]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [creating, setCreating]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]     = useState(false);

  // Resolve current user ID for ownership checks
  const currentUserId = (() => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId ?? payload.id ?? payload.sub ?? null;
    } catch { return null; }
  })();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRooms(); // no limit — fetch all
        if (!cancelled) setRooms(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ?? 'Failed to load rooms. Please try again.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const activeRooms = rooms.filter(r => r.status === 'ACTIVE');
  const endedRooms = rooms.filter(r => r.status === 'ENDED');

  /* ── Create Room ── */
  const handleCreateRoom = async () => {
    setCreating(true);
    try {
      const room = await createRoom();
      const roomId = room?.id ?? room?.roomId ?? room?._id;
      navigate(`/room/${roomId}`);
    } catch (err) {
      alert(err?.response?.data?.message ?? 'Could not create room.');
    } finally {
      setCreating(false);
    }
  };

  /* ── Rename ── */
  const handleRename = async (roomId, newName) => {
    try {
      await renameRoom(roomId, newName);
      setRooms((prev) =>
        prev.map((r) => (r.id === roomId ? { ...r, name: newName } : r))
      );
    } catch (err) {
      alert(err?.response?.data?.message ?? 'Failed to rename room.');
    }
  };

  /* ── Delete ── */
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRoomApi(deleteTarget);
      setRooms((prev) => prev.filter((r) => r.id !== deleteTarget));
    } catch (err) {
      alert(err?.response?.data?.message ?? 'Failed to delete room.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="dashboard-shell">
      <Navbar activePage="rooms" />

      <div className="dashboard-body">
        {/* ── Main Content ── */}
        <main className="dashboard-main">
          <div className="dashboard-heading" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h1 className="dashboard-title">All Rooms</h1>
                <p className="dashboard-welcome">
                  View and manage all your collaborative coding spaces.
                  {!loading && !error && (
                    <>
                      {' '}You have <strong style={{ color: 'var(--color-accent)' }}>{activeRooms.length} active</strong> and{' '}
                      <strong style={{ color: 'var(--color-text-muted)' }}>{endedRooms.length} ended</strong> rooms.
                    </>
                  )}
                </p>
              </div>
              <button
                id="create-room-all-btn"
                className="btn-create"
                onClick={handleCreateRoom}
                disabled={creating}
                style={{ width: 'auto', padding: '0 20px', flexShrink: 0 }}
              >
                {creating ? <SpinnerIcon /> : <PlusIcon />}
                {creating ? 'Creating…' : 'New Room'}
              </button>
            </div>
          </div>

          {loading && (
            <div className="rooms-state-msg">Loading rooms…</div>
          )}

          {error && !loading && (
            <div className="rooms-state-msg rooms-state-msg--error" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && rooms.length === 0 && (
            <div className="rooms-state-msg">
              No rooms found. Create one to get started!
            </div>
          )}

          {/* ── Active Rooms Section ── */}
          {!loading && !error && activeRooms.length > 0 && (
            <section style={{ marginBottom: '32px' }}>
              <div className="section-header">
                <h2 className="section-title">
                  Active Rooms
                  <span style={{
                    marginLeft: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#16A34A',
                    background: 'rgba(22, 163, 74, 0.08)',
                    padding: '2px 8px',
                    borderRadius: '20px'
                  }}>
                    {activeRooms.length}
                  </span>
                </h2>
              </div>
              <div className="room-list">
                {activeRooms.map((room, i) => (
                  <RoomCard
                    key={room.id ?? room._id ?? room.name}
                    room={room}
                    index={i}
                    isOwner={room.createdBy === currentUserId}
                    onRename={handleRename}
                    onDelete={(id) => setDeleteTarget(id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Ended Rooms Section ── */}
          {!loading && !error && endedRooms.length > 0 && (
            <section>
              <div className="section-header">
                <h2 className="section-title">
                  Ended Rooms
                  <span style={{
                    marginLeft: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#94A3B8',
                    background: 'rgba(148, 163, 184, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '20px'
                  }}>
                    {endedRooms.length}
                  </span>
                </h2>
              </div>
              <div className="room-list">
                {endedRooms.map((room, i) => (
                  <RoomCard
                    key={room.id ?? room._id ?? room.name}
                    room={room}
                    index={i}
                    isOwner={room.createdBy === currentUserId}
                    onRename={handleRename}
                    onDelete={(id) => setDeleteTarget(id)}
                  />
                ))}
              </div>
            </section>
          )}
        </main>

        {/* ── Right Sidebar ── */}
        <Sidebar />
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Room"
          message="This will permanently delete this room and remove all participants. This action cannot be undone."
          confirmLabel="Delete Room"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          danger
          loading={deleting}
        />
      )}
    </div>
  );
}
