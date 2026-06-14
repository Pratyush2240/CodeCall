import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoom, endRoom } from '../api/rooms';
import { useSocket } from '../hooks/useSocket';
import { usePresence } from '../hooks/usePresence';
import { useCollaborativeCode } from '../hooks/useCollaborativeCode';
import { useChat } from '../hooks/useChat';
import { useWebRTC } from '../hooks/useWebRTC';
import { useWhiteboard } from '../hooks/useWhiteboard';
import { useCodeExecution } from '../hooks/useCodeExecution';
import { useCursors } from '../hooks/useCursors';
import CodeEditor from '../components/CodeEditor';
import DSACanvas from '../components/DSACanvas';
import InviteModal from '../components/InviteModal';
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

const DSAIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="12" cy="18" r="3" />
    <line x1="8.5" y1="7.5" x2="10" y2="16" />
    <line x1="15.5" y1="7.5" x2="14" y2="16" />
  </svg>
);

const WhiteboardIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
  </svg>
);

const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const EraserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 20H7L3 16c-.8-.8-.8-2 0-2.8L14.6 1.6c.8-.8 2-.8 2.8 0l4 4c.8.8.8 2 0 2.8L10 20" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const WB_COLORS = ['#E6EDF3','#F85149','#3FB950','#58A6FF','#F59E0B','#EC4899','#8B5CF6','#0EA5E9'];

const ChatIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const MicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const MicOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
    <path d="M17 16.95A7 7 0 015 12v-2m14 0v2c0 .87-.16 1.71-.46 2.49" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const CamIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const CamOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M21 21H3a2 2 0 01-2-2V8a2 2 0 012-2h3m3-3h6l2 3h4a2 2 0 012 2v9.34m-7.72-2.06a4 4 0 11-5.56-5.56" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const PhoneOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.42 19.42 0 01-3.33-2.67m-2.67-3.34a19.79 19.79 0 01-3.07-8.63A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91" />
    <line x1="23" y1="1" x2="1" y2="23" />
  </svg>
);

/* ── VideoTile — renders a single video stream ─── */
const VideoTile = ({ stream, muted, label }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);
  return (
    <div className="rs-video-tile">
      <video ref={ref} autoPlay playsInline muted={muted} />
      <span className="rs-video-label">{label}</span>
    </div>
  );
};

/* ── Avatar helpers ───────────────────────────────────────────── */
const AVATAR_COLORS = ['#6366F1', '#0EA5E9', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6'];
const avatarColor   = (str = '') => AVATAR_COLORS[str.charCodeAt(0) % AVATAR_COLORS.length];
const initials      = (str = '') => str.slice(0, 2).toUpperCase();

/* ── ParticipantRow ───────────────────────────────────────────── */
const ParticipantRow = ({ id, isAdmin, isSelf, isTyping }) => (
  <div className="rs-participant">
    <div className="rs-avatar-wrap">
      <div className="rs-avatar" style={{ background: avatarColor(id) }}>
        {initials(id)}
      </div>
      <span className="rs-online-dot" />
    </div>
    <div className="rs-participant-info">
      <span className="rs-participant-name">
        {isSelf ? 'You' : `User ${id.slice(0, 6)}`}
        {isAdmin && <span className="rs-admin-tag"> (Host)</span>}
      </span>
      {isTyping && (
        <span className="rs-typing-indicator" aria-label="Typing">
          <span className="rs-typing-dot" />
          <span className="rs-typing-dot" />
          <span className="rs-typing-dot" />
          <span className="rs-typing-label">editing</span>
        </span>
      )}
    </div>
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
  const [showInviteModal, setShowInviteModal] = useState(false);


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

  /* ── Socket connection ── */
  const { socket, isConnected } = useSocket(roomId);

  useEffect(() => {
    if (!socket) return;
    const handleRoomExpired = () => {
      setError("This room has expired due to inactivity.");
    };
    socket.on("room-expired", handleRoomExpired);
    return () => {
      socket.off("room-expired", handleRoomExpired);
    };
  }, [socket]);

  /* ── Realtime presence ── */
  const { onlineUsers, typingUsers, emitTyping } = usePresence(socket, roomId);

  /* ── Collaborative cursor sync ── */
  const [editorInstance, setEditorInstance] = useState(null);
  const { markLocalEdit } = useCursors(socket, roomId, editorInstance, currentUserId);

  /* ── Collaborative code sync (typing callback wired in) ── */
  const { code, handleEditorChange } = useCollaborativeCode(socket, roomId, {
    onLocalChange: () => {
      emitTyping();
      markLocalEdit();
    },
  });

  /* ── Room chat ── */
  const { messages, sendMessage, scrollRef } = useChat(socket, roomId);
  const [chatInput, setChatInput] = useState('');

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(chatInput);
    setChatInput('');
  };

  /* ── WebRTC voice/video ── */
  const {
    localStream, remoteStreams, isInCall,
    isMicOn, isCamOn,
    joinCall, leaveCall, toggleMic, toggleCam,
  } = useWebRTC(socket, roomId, currentUserId);

  /* ── Whiteboard ── */
  const {
    objects: wbObjects,
    setObjects: setWbObjects,
    clearBoard,
    initCanvas,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    resizeCanvas,
    tool: wbTool, setTool: setWbTool,
    brushSize: wbSize, setBrushSize: setWbSize,
    color: wbColor, setColor: setWbColor,
  } = useWhiteboard(socket, roomId);

  // ── Code Execution ──
  const {
    language,
    setLanguage,
    output,
    isRunning,
    runCode,
    clearOutput,
    stdinRef,
  } = useCodeExecution(socket, roomId, code);

  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'whiteboard'

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
  const isEnded      = roomStatus === 'ENDED';

  /* ── Live presence: prefer socket data, fall back to API ── */
  const displayUsers = isConnected && onlineUsers.length > 0
    ? onlineUsers.map((u) => u.userId)
    : participants;
  const liveCount = displayUsers.length;

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

          {/* Invite — admin only, only when active */}
          {isAdmin && !isEnded && (
            <button
              id="invite-users-btn"
              className="rs-invite-header-btn"
              onClick={() => setShowInviteModal(true)}
              aria-label="Invite users"
            >
              <UsersIcon />
              Invite
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


          {/* Join/Leave Call */}
          {!isInCall ? (
            <button
              id="join-call-btn"
              className="rs-call-btn"
              onClick={joinCall}
              aria-label="Join voice/video call"
            >
              <PhoneIcon />
              Join Call
            </button>
          ) : (
            <button
              className="rs-call-btn rs-call-btn--active"
              onClick={leaveCall}
              aria-label="Leave call"
            >
              <PhoneOffIcon />
              Leave Call
            </button>
          )}
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

      {/* ── Invite modal ── */}
      {showInviteModal && (
        <InviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          roomId={roomId}
          participants={participants}
        />
      )}


      {/* ── Video bar (shown when in call) ── */}
      {isInCall && (
        <div className="rs-video-bar">
          <div className="rs-video-streams">
            <VideoTile stream={localStream} muted label="You" />
            {Object.entries(remoteStreams).map(([userId, stream]) => (
              <VideoTile
                key={userId}
                stream={stream}
                muted={false}
                label={`User ${userId.slice(0, 6)}`}
              />
            ))}
          </div>
          <div className="rs-video-controls">
            <button
              className={`rs-vc-btn ${!isMicOn ? 'rs-vc-btn--off' : ''}`}
              onClick={toggleMic}
              aria-label={isMicOn ? 'Mute mic' : 'Unmute mic'}
            >
              {isMicOn ? <MicIcon /> : <MicOffIcon />}
            </button>
            <button
              className={`rs-vc-btn ${!isCamOn ? 'rs-vc-btn--off' : ''}`}
              onClick={toggleCam}
              aria-label={isCamOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isCamOn ? <CamIcon /> : <CamOffIcon />}
            </button>
            <button
              className="rs-vc-btn rs-vc-btn--hangup"
              onClick={leaveCall}
              aria-label="Leave call"
            >
              <PhoneOffIcon />
            </button>
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div className="rs-body">

        {/* ── Editor / Whiteboard pane ── */}
        <main className="rs-editor-pane">
          {/* Tab bar — Editor | Whiteboard */}
          <div className="rs-tab-bar">
            <div
              className={`rs-tab ${activeTab === 'editor' ? 'rs-tab--active' : ''}`}
              onClick={() => setActiveTab('editor')}
            >
              <CodeEditorIcon />
              Editor
            </div>
            <div
              className={`rs-tab ${activeTab === 'whiteboard' ? 'rs-tab--active' : ''}`}
              onClick={() => { setActiveTab('whiteboard'); setTimeout(resizeCanvas, 50); }}
            >
              <WhiteboardIcon />
              Whiteboard
            </div>
            <div
              className={`rs-tab ${activeTab === 'dsa' ? 'rs-tab--active' : ''}`}
              onClick={() => setActiveTab('dsa')}
            >
              <DSAIcon />
              DSA Board
            </div>
          </div>

          {/* Code editor — IDE layout */}
          <div style={{ display: activeTab === 'editor' ? 'flex' : 'none', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <CodeEditor
              value={code}
              onChange={handleEditorChange}
              isConnected={isConnected}
              language={language}
              setLanguage={setLanguage}
              output={output}
              isRunning={isRunning}
              onRun={runCode}
              onClear={clearOutput}
              stdinRef={stdinRef}
              onEditorMount={setEditorInstance}
            />
          </div>

          {/* Whiteboard canvas */}
          <div className="rs-wb-container" style={{ display: activeTab === 'whiteboard' ? 'flex' : 'none' }}>
              {/* Toolbar */}
              <div className="rs-wb-toolbar">
                <button
                  className={`rs-wb-tool ${wbTool === 'pencil' ? 'rs-wb-tool--active' : ''}`}
                  onClick={() => setWbTool('pencil')}
                  aria-label="Pencil"
                  title="Pencil"
                >
                  <PencilIcon />
                </button>
                <button
                  className={`rs-wb-tool ${wbTool === 'eraser' ? 'rs-wb-tool--active' : ''}`}
                  onClick={() => setWbTool('eraser')}
                  aria-label="Eraser"
                  title="Eraser"
                >
                  <EraserIcon />
                </button>

                <span className="rs-wb-divider" />

                {/* Color swatches */}
                <div className="rs-wb-colors">
                  {WB_COLORS.map((c) => (
                    <button
                      key={c}
                      className={`rs-wb-swatch ${wbColor === c ? 'rs-wb-swatch--active' : ''}`}
                      style={{ background: c }}
                      onClick={() => setWbColor(c)}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>

                <span className="rs-wb-divider" />

                {/* Brush size */}
                <label className="rs-wb-size-label" title="Brush size">
                  <span>{wbSize}px</span>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={wbSize}
                    onChange={(e) => setWbSize(Number(e.target.value))}
                    className="rs-wb-size-slider"
                  />
                </label>

                <span className="rs-wb-divider" />

                <button
                  className="rs-wb-tool rs-wb-tool--danger"
                  onClick={clearBoard}
                  aria-label="Clear board"
                  title="Clear board"
                >
                  <TrashIcon />
                </button>
              </div>

              {/* Canvas */}
              <div className="rs-wb-canvas-wrap">
                <canvas
                  ref={(el) => { if (el) initCanvas(el); }}
                  className="rs-wb-canvas"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerLeave={onPointerUp}
                  style={{ cursor: wbTool === 'eraser' ? 'cell' : 'crosshair' }}
                />
              </div>
          </div>

          {/* DSA Visualization board */}
          <div style={{ display: activeTab === 'dsa' ? 'flex' : 'none', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <DSACanvas socket={socket} roomId={roomId} />
          </div>

          {/* Status bar — dynamic values only */}
          <div className="rs-status-bar" aria-label="Session status">
            <span className="rs-status-item rs-status-ready">⟳ {roomStatus}</span>
            <span className="rs-status-item">{roomName}</span>
            <span className="rs-status-item" title="Invite code">📋 {roomCode}</span>
            <span className="rs-status-spacer" />
            <span className="rs-status-item">
              {isConnected ? "🟢 Connected" : "⏳ Connecting…"}
            </span>
            <span className="rs-status-item">{liveCount} online</span>
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
              {liveCount} Online
            </span>
          </div>

          <p className="rs-sidebar-sub">Collaborating in {roomName}</p>

          <div className="rs-participants-list">
            {displayUsers.length > 0
              ? displayUsers.map((p) => (
                  <ParticipantRow
                    key={p}
                    id={p}
                    isAdmin={p === room.createdBy}
                    isSelf={p === currentUserId}
                    isTyping={typingUsers.has(p)}
                  />
                ))
              : (
                <p className="rs-no-participants">
                  No participants yet. Share code <strong>{roomCode}</strong> to invite others.
                </p>
              )
            }
          </div>

          {/* ── Chat panel ── */}
          <div className="rs-chat-panel">
            <div className="rs-chat-header">
              <ChatIcon />
              <span className="rs-chat-title">Chat</span>
              <span className="rs-chat-count">{messages.length}</span>
            </div>

            <div className="rs-chat-messages" ref={scrollRef}>
              {messages.length === 0 ? (
                <p className="rs-chat-empty">No messages yet. Say hello!</p>
              ) : (
                messages.map((msg) => {
                  const isSelf = msg.userId === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`rs-chat-bubble ${isSelf ? 'rs-chat-bubble--self' : ''}`}
                    >
                      {!isSelf && (
                        <span className="rs-chat-sender">
                          User {msg.userId.slice(0, 6)}
                        </span>
                      )}
                      <span className="rs-chat-text">{msg.text}</span>
                      <span className="rs-chat-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <form className="rs-chat-input-row" onSubmit={handleSendChat}>
              <input
                id="chat-input"
                className="rs-chat-input"
                type="text"
                placeholder="Type a message…"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                autoComplete="off"
              />
              <button
                id="chat-send-btn"
                className="rs-chat-send"
                type="submit"
                disabled={!chatInput.trim()}
                aria-label="Send message"
              >
                <SendIcon />
              </button>
            </form>
          </div>
        </aside>

      </div>
    </div>
  );
}
