import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RoomCard from '../components/RoomCard';
import ConfirmModal from '../components/ConfirmModal';
import InvitationCard from '../components/InvitationCard';
import { useUser } from '../context/UserContext';
import { createRoom, joinRoom, getRooms, renameRoom, deleteRoom as deleteRoomApi } from '../api/rooms';
import { getMyInvitations, acceptInvitation, declineInvitation } from '../api/invitations';
import './Dashboard.css';


/* ── Icons ── */
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const DoorIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 4H6a2 2 0 00-2 2v12a2 2 0 002 2h7" />
    <path d="M17 8l4 4-4 4" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const VideoIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ animation: 'spin 0.8s linear infinite' }}>
    <path d="M21 12a9 9 0 11-6.219-8.56" />
  </svg>
);

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user }  = useUser();

  // Derive first name for greeting
  const firstName = user?.fullName
    ? user.fullName.trim().split(' ')[0]
    : user?.username || 'there';

  // Resolve current user ID for ownership checks
  const currentUserId = (() => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId ?? payload.id ?? payload.sub ?? null;
    } catch { return null; }
  })();

  /* ── State ── */
  const [roomCode, setRoomCode]           = useState('');
  const [roomName, setRoomName]           = useState('');
  const [recentRooms, setRecentRooms]     = useState([]);
  const [roomsLoading, setRoomsLoading]   = useState(true);
  const [roomsError, setRoomsError]       = useState(null);
  const [creating, setCreating]           = useState(false);
  const [createError, setCreateError]     = useState(null);
  const [joining, setJoining]             = useState(false);
  const [joinError, setJoinError]         = useState(null);
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleting, setDeleting]           = useState(false);

  const [invitations, setInvitations]           = useState([]);
  const [invitationsLoading, setInvitationsLoading] = useState(true);

  /* ── Fetch pending invitations on mount ── */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setInvitationsLoading(true);
        const data = await getMyInvitations();
        if (!cancelled) setInvitations(data || []);
      } catch (err) {
        console.error('Failed to load invitations:', err);
      } finally {
        if (!cancelled) setInvitationsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  /* ── Accept Invitation ── */
  const handleAcceptInvitation = async (invitationId) => {
    try {
      const room = await acceptInvitation(invitationId);
      const roomId = room?.id ?? room?.roomId ?? room?._id;
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
      navigate(`/room/${roomId}`);
    } catch (err) {
      alert(err?.response?.data?.message ?? 'Failed to accept invitation.');
    }
  };

  /* ── Decline Invitation ── */
  const handleDeclineInvitation = async (invitationId) => {
    try {
      await declineInvitation(invitationId);
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
    } catch (err) {
      alert(err?.response?.data?.message ?? 'Failed to decline invitation.');
    }
  };

  /* ── Fetch recent rooms on mount (limit 3) ── */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setRoomsLoading(true);
        setRoomsError(null);
        const rooms = await getRooms(null, 3);
        if (!cancelled) setRecentRooms(rooms);
      } catch (err) {
        if (!cancelled) {
          setRoomsError(
            err?.response?.data?.message ?? 'Failed to load rooms. Please try again.'
          );
        }
      } finally {
        if (!cancelled) setRoomsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);


  /* ── Create Room ── */
  const handleCreateRoom = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      const room = await createRoom(roomName.trim() || null);
      const roomId = room?.id ?? room?.roomId ?? room?._id;
      navigate(`/room/${roomId}`);
    } catch (err) {
      setCreateError(
        err?.response?.data?.message ?? 'Could not create room. Please try again.'
      );
    } finally {
      setCreating(false);
    }
  };

  /* ── Join Room ── */
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    const trimmed = roomCode.trim();
    if (!trimmed) return; // guard — button is also disabled when empty

    setJoining(true);
    setJoinError(null);
    try {
      const room = await joinRoom(trimmed);
      const roomId = room?.id ?? room?.roomId ?? room?._id;
      navigate(`/room/${roomId}`);
    } catch (err) {
      setJoinError(
        err?.response?.data?.message ?? 'Invalid room code. Please check and try again.'
      );
    } finally {
      setJoining(false);
    }
  };

  /* ── Rename Room ── */
  const handleRename = async (roomId, newName) => {
    try {
      await renameRoom(roomId, newName);
      setRecentRooms((prev) =>
        prev.map((r) => (r.id === roomId ? { ...r, name: newName } : r))
      );
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
      setRecentRooms((prev) => prev.filter((r) => r.id !== deleteTarget));
    } catch (err) {
      alert(err?.response?.data?.message ?? 'Failed to delete room.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="dashboard-shell">
      <Navbar activePage="dashboard" />

      <div className="dashboard-body">
        {/* ── Main Content ── */}
        <main className="dashboard-main">

          {/* Page title */}
          <div className="dashboard-heading">
            <h1 className="dashboard-title">Workspace Dashboard</h1>
            <p className="dashboard-welcome">
              Welcome back, <strong style={{ color: 'var(--color-accent)' }}>{firstName}</strong>. You have{' '}
              <strong style={{ color: 'var(--color-accent)' }}>
                {recentRooms.filter(r => r.status === 'ACTIVE' || r.status === 'active').length} active rooms
              </strong>{' '}
              today.
            </p>
          </div>

          {/* Create / Join Cards */}
          <div className="action-cards">

            {/* ── Create Room ── */}
            <div className="action-card">
              <div className="action-card-icons">
                <div className="action-icon action-icon--blue">
                  <VideoIcon />
                </div>
                <div className="action-icon-ghost">
                  <PlusIcon />
                </div>
              </div>
              <h2 className="action-card-title">Create Room</h2>
              <p className="action-card-desc">
                Start a new instant session with voice, video, and shared code editor.
              </p>

              {createError && (
                <p className="action-error" role="alert">{createError}</p>
              )}

              <div className="create-room-field">
                <label className="create-room-label" htmlFor="room-name-input">
                  Session Name
                  <span className="create-room-optional">Optional</span>
                </label>
                <input
                  id="room-name-input"
                  type="text"
                  className="join-input"
                  placeholder="e.g. Sprint Review, DSA Practice…"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  disabled={creating}
                  aria-label="Room name"
                  maxLength={50}
                />
              </div>

              <button
                id="create-room-btn"
                className="btn-create"
                onClick={handleCreateRoom}
                disabled={creating}
              >
                {creating ? <SpinnerIcon /> : <PlusIcon />}
                {creating ? 'Creating…' : 'New Session'}
              </button>
            </div>

            {/* ── Join Room ── */}
            <div className="action-card">
              <div className="action-card-icons">
                <div className="action-icon action-icon--neutral">
                  <DoorIcon />
                </div>
                <div className="action-icon-ghost action-icon-ghost--right">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                    strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </div>
              </div>
              <h2 className="action-card-title">Join Room</h2>
              <p className="action-card-desc">
                Enter a room code or invite link to collaborate with your team members.
              </p>

              {joinError && (
                <p className="action-error" role="alert">{joinError}</p>
              )}

              <form className="join-input-group" onSubmit={handleJoinRoom} noValidate>
                <input
                  id="room-code-input"
                  type="text"
                  className="join-input"
                  placeholder="Enter code…"
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value)}
                  aria-label="Enter room code"
                  disabled={joining}
                />
                <button
                  id="enter-code-btn"
                  type="submit"
                  className="btn-join"
                  disabled={!roomCode.trim() || joining}
                >
                  {joining ? 'Joining…' : 'Enter Code'}
                </button>
              </form>
            </div>
          </div>

          {/* ── Pending Invitations ── */}

          {invitations.length > 0 && (
            <section className="dashboard-invitations-section" aria-label="Pending invitations" style={{ marginBottom: '36px' }}>
              <div className="section-header">
                <h2 className="section-title">Pending Invitations</h2>
              </div>
              <div className="invitations-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {invitations.map((invite) => (
                  <InvitationCard
                    key={invite.id}
                    invitation={invite}
                    onAccept={handleAcceptInvitation}
                    onDecline={handleDeclineInvitation}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Recent Rooms ── */}
          <section className="recent-rooms-section" aria-label="Recent rooms">

            <div className="section-header">
              <h2 className="section-title">Recent Rooms</h2>
              <a href="/rooms" className="section-link">View All</a>
            </div>

            {roomsLoading && (
              <div className="rooms-state-msg">Loading rooms…</div>
            )}

            {roomsError && !roomsLoading && (
              <div className="rooms-state-msg rooms-state-msg--error" role="alert">
                {roomsError}
              </div>
            )}

            {!roomsLoading && !roomsError && recentRooms.length === 0 && (
              <div className="rooms-state-msg">
                No rooms yet — create one to get started!
              </div>
            )}

            {!roomsLoading && !roomsError && recentRooms.length > 0 && (
              <div className="room-list">
                {recentRooms.map((room, i) => (
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
            )}
          </section>

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
