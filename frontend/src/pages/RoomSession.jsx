import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoom, endRoom } from '../api/rooms';
import { useSocket } from '../hooks/useSocket';
import { useCollaborativeCode } from '../hooks/useCollaborativeCode';
import CodeEditor from '../components/CodeEditor';
import './RoomSession.css';

/* ── Icons ────────────────────────────────────────────────────── */
const LeaveIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const StopIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

const ChevronRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const UsersIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const CodeEditorIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

/* ── Avatar helpers ───────────────────────────────────────────── */
const AVATAR_COLORS = ['#6366F1', '#0EA5E9', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6'];
const avatarColor   = (str = '') => AVATAR_COLORS[str.charCodeAt(0) % AVATAR_COLORS.length];
const initials      = (str = '') => str.slice(0, 2).toUpperCase();

/* ── ParticipantRow ───────────────────────────────────────────── */
const ParticipantRow = ({ id, isAdmin, isSelf }) => (
  <div className="rs-participant">
    <div className="rs-avatar" style={{ background: avatarColor(id) }}>
      {initials(id)}
    </div>
    <span className="rs-participant-name">
      {isSelf ? 'You' : `User ${id.slice(0, 6)}`}
      {isAdmin && <span className="rs-admin-tag"> (Host)</span>}
    </span>
    {isAdmin && <span className="rs-participant-badge">Admin</span>}
  </div>
);

/* ════════════════════════════════════════════════════════════════
   RoomSessionPage
   ════════════════════════════════════════════════════════════════ */
export default function RoomSessionPage() {
  const { roomId } = useParams();
  const navigate   = useNavigate();

  const [room, setRoom]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [ending, setEnding]       = useState(false);   // PATCH in-flight
  const [showConfirm, setShowConfirm] = useState(false); // confirm dialog

  /* ── Socket connection + collaborative code sync ── */
  const { socket, isConnected } = useSocket(roomId);
  const { code, handleEditorChange } = useCollaborativeCode(socket, roomId);

  /* Resolve logged-in user ID from the stored JWT payload */
  const currentUserId = (() => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId ?? payload.id ?? payload.sub ?? null;
    } catch {
      return null;
    }
  })();

  /* ── Fetch room on mount ── */
  useEffect(() => {
    if (!roomId) {
      navigate('/dashboard', { replace: true });
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRoom(roomId);
        if (!cancelled) setRoom(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ?? 'Room not found or access denied.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [roomId, navigate]);

  /* ── Auto-redirect countdown on error ── */
  useEffect(() => {
    if (!error) return;
    if (countdown <= 0) { navigate('/dashboard', { replace: true }); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [error, countdown, navigate]);

  /* ── End Room handler ── */
  const handleEndRoom = async () => {
    setEnding(true);
    try {
      await endRoom(roomId);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      alert(err?.response?.data?.message ?? 'Failed to end the room.');
    } finally {
      setEnding(false);
      setShowConfirm(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="rs-shell">
        <div className="rs-loading" role="status" aria-live="polite">
          <div className="rs-spinner" aria-hidden="true" />
          <span>Connecting to room…</span>
        </div>
      </div>
    );
  }

  /* ── Error → auto-redirect ── */
  if (error) {
    return (
      <div className="rs-shell">
        <div className="rs-error-state" role="alert">
          <div className="rs-error-icon"><AlertIcon /></div>
          <h2 className="rs-error-title">Unable to join room</h2>
          <p className="rs-error-msg">{error}</p>
          <p className="rs-error-redirect">
            Redirecting to dashboard in <strong>{countdown}s</strong>…
          </p>
          <button
            className="rs-error-btn"
            onClick={() => navigate('/dashboard', { replace: true })}
          >
            Go now
          </button>
        </div>
      </div>
    );
  }

  /* ── Derived values — all from API response ── */
  const roomName     = room.name;
  const roomCode     = room.code;
  const roomStatus   = room.status;
  const participants = room.participants ?? [];
  const createdAt    = room.createdAt ? new Date(room.createdAt).toLocaleString() : null;
  const isAdmin      = room.createdBy === currentUserId;  // ← determines role
  const isEnded      = roomStatus === 'ended';

  /* ── Main UI ── */
  return (
    <div className="rs-shell">

      {/* ── Header ── */}
      <header className="rs-header">
        <div className="rs-header-left">
          <span className="rs-brand">CodeCall</span>
          <span className="rs-sep">|</span>
          <ChevronRight />
          <span className="rs-room-name">{roomName}</span>
          {isAdmin && <span className="rs-admin-pill">Admin</span>}
          <span className={`rs-status-pill rs-status-pill--${roomStatus}`}>
            {roomStatus}
          </span>
        </div>

        <div className="rs-header-actions">
          {/* End Room — admin only, only when active */}
          {isAdmin && !isEnded && (
            <button
              id="end-room-btn"
              className="rs-end-btn"
              onClick={() => setShowConfirm(true)}
              disabled={ending}
              aria-label="End room for everyone"
            >
              <StopIcon />
              End Room
            </button>
          )}

          {/* Leave Room — always visible */}
          <button
            className="rs-leave-btn"
            onClick={() => navigate('/dashboard')}
            aria-label="Leave room"
          >
            <LeaveIcon />
            Leave Room
          </button>
        </div>
      </header>

      {/* ── End Room confirm dialog ── */}
      {showConfirm && (
        <div className="rs-confirm-overlay" role="dialog" aria-modal="true"
          aria-labelledby="confirm-title">
          <div className="rs-confirm-box">
            <h3 id="confirm-title" className="rs-confirm-title">End this room?</h3>
            <p className="rs-confirm-msg">
              This will permanently end <strong>{roomName}</strong> for all participants.
              This action cannot be undone.
            </p>
            <div className="rs-confirm-actions">
              <button
                className="rs-confirm-cancel"
                onClick={() => setShowConfirm(false)}
                disabled={ending}
              >
                Cancel
              </button>
              <button
                id="confirm-end-room-btn"
                className="rs-confirm-end"
                onClick={handleEndRoom}
                disabled={ending}
              >
                {ending ? 'Ending…' : 'Yes, End Room'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div className="rs-body">

        {/* ── Editor pane ── */}
        <main className="rs-editor-pane">
          {/* Empty tab bar — no hardcoded filenames */}
          <div className="rs-tab-bar">
            <div className="rs-tab rs-tab--active">
              <CodeEditorIcon />
              Editor
            </div>
          </div>

          {/* Code editor — live collaborative */}
          <CodeEditor
            value={code}
            onChange={handleEditorChange}
            isConnected={isConnected}
          />

          {/* Status bar — dynamic values only */}
          <div className="rs-status-bar" aria-label="Session status">
            <span className="rs-status-item rs-status-ready">⟳ {roomStatus}</span>
            <span className="rs-status-item">{roomName}</span>
            <span className="rs-status-item" title="Invite code">📋 {roomCode}</span>
            <span className="rs-status-spacer" />
            <span className="rs-status-item">
              {isConnected ? "🟢 Connected" : "⏳ Connecting…"}
            </span>
            <span className="rs-status-item">{participants.length} participants</span>
          </div>
        </main>

        {/* ── Participants panel ── */}
        <aside className="rs-sidebar" aria-label="Participants">
          <div className="rs-sidebar-header">
            <div className="rs-sidebar-title-row">
              <UsersIcon />
              <span className="rs-sidebar-title">Participants</span>
            </div>
            <span className="rs-online-badge">
              {participants.length} Online
            </span>
          </div>

          <p className="rs-sidebar-sub">Collaborating in {roomName}</p>

          <div className="rs-participants-list">
            {participants.length > 0
              ? participants.map((p) => (
                  <ParticipantRow
                    key={p}
                    id={p}
                    isAdmin={p === room.createdBy}
                    isSelf={p === currentUserId}
                  />
                ))
              : (
                <p className="rs-no-participants">
                  No participants yet. Share code <strong>{roomCode}</strong> to invite others.
                </p>
              )
            }
          </div>

          <div className="rs-sidebar-footer">
            <button className="rs-invite-btn">
              <UsersIcon />
              Invite Others
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
}
