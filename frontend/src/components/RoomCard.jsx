import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoomCard.css';

/* ── Icons ── */
const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="19" r="1" fill="currentColor" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ── Relative time helper ── */
function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return new Date(dateStr).toLocaleDateString();
}

/* ── Deterministic avatar color from name ── */
const avatarColors = ['#6366F1', '#0EA5E9', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6'];
const getAvatarColor = (name) =>
  avatarColors[name.charCodeAt(0) % avatarColors.length];

const AvatarGroup = ({ participants }) => {
  const count = typeof participants === 'number' ? participants : 0;
  const names = Array.from({ length: Math.min(count, 3) }, (_, i) =>
    String.fromCharCode(65 + i)
  );
  const extra = count - names.length;

  return (
    <div className="avatar-group">
      {names.map((letter, i) => (
        <div
          key={i}
          className="avatar-chip"
          style={{ background: getAvatarColor(letter), zIndex: names.length - i }}
        >
          {letter}
        </div>
      ))}
      {extra > 0 && (
        <div className="avatar-chip avatar-chip--extra">+{extra}</div>
      )}
    </div>
  );
};

const RoomIcon = ({ color, icon }) => (
  <div className="room-icon" style={{ background: color }}>
    {icon}
  </div>
);

const TerminalSvg = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

const GearSvg = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83
      0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65
      1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65
      1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65
      1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65
      1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2
      2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65
      1.65 0 00-1.51 1z" />
  </svg>
);

const ShieldSvg = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const iconCycle = [
  { icon: TerminalSvg, color: '#1E293B' },
  { icon: GearSvg, color: '#3B82F6' },
  { icon: ShieldSvg, color: '#F97316' },
];

export default function RoomCard({ room, index = 0, isOwner = false, onRename, onDelete }) {
  const { name, code, status, lastActivity, lastUpdated, participants, endedAt } = room;
  const { icon, color } = iconCycle[index % iconCycle.length];
  const navigate = useNavigate();

  const isEnded = status === 'ENDED';
  const roomId = room.id ?? room._id ?? room.name;

  const getRoomNameParts = () => {
    if (room.projectId && name.includes(' - ')) {
      const idx = name.indexOf(' - ');
      return {
        prefix: name.substring(0, idx + 3), // "testing 2 - "
        editable: name.substring(idx + 3),   // "Room 4WI-BTL"
      };
    }
    return {
      prefix: '',
      editable: name,
    };
  };

  const parts = getRoomNameParts();

  /* ── State ── */
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(parts.editable);
  const [renameLoading, setRenameLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);
  const renameInputRef = useRef(null);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  /* Focus rename input when entering rename mode */
  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming]);

  /* ── Handlers ── */
  const handleCardClick = () => {
    if (isEnded || isRenaming) return;
    navigate(`/room/${roomId}`);
  };

  const handleMoreClick = (e) => {
    e.stopPropagation();
    setDropdownOpen((prev) => !prev);
  };

  const handleCopyCode = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard access may fail */ }
    setDropdownOpen(false);
  };

  const handleStartRename = (e) => {
    e.stopPropagation();
    const currentParts = getRoomNameParts();
    setRenameValue(currentParts.editable);
    setIsRenaming(true);
    setDropdownOpen(false);
  };

  const handleCancelRename = (e) => {
    e?.stopPropagation();
    setIsRenaming(false);
    const currentParts = getRoomNameParts();
    setRenameValue(currentParts.editable);
  };

  const handleConfirmRename = async (e) => {
    e?.stopPropagation();
    const currentParts = getRoomNameParts();
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed.length < 2) {
      handleCancelRename();
      return;
    }
    const fullNewName = currentParts.prefix + trimmed;
    if (fullNewName === name) {
      handleCancelRename();
      return;
    }
    if (onRename) {
      setRenameLoading(true);
      try {
        await onRename(roomId, fullNewName);
      } catch { /* parent handles errors */ }
      setRenameLoading(false);
    }
    setIsRenaming(false);
  };

  const handleRenameKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') handleConfirmRename(e);
    if (e.key === 'Escape') handleCancelRename(e);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setDropdownOpen(false);
    if (onDelete) onDelete(roomId);
  };

  /* ── Time display ── */
  const displayTime = timeAgo(lastActivity || lastUpdated);

  return (
    <div
      className={`room-card ${isEnded ? 'room-card--ended' : 'room-card--clickable'}`}
      onClick={handleCardClick}
      role={isEnded ? undefined : 'button'}
      tabIndex={isEnded ? -1 : 0}
      aria-label={isEnded ? `Room ${name} (ended)` : `Open room ${name}`}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
    >
      <RoomIcon color={isEnded ? '#94A3B8' : color} icon={icon} />

      <div className="room-info">
        {isRenaming ? (
          <div className="room-rename-row" onClick={(e) => e.stopPropagation()}>
            {parts.prefix && <span className="room-rename-prefix-text">{parts.prefix}</span>}
            <input
              ref={renameInputRef}
              className="room-rename-input"
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={handleRenameKeyDown}
              maxLength={50 - parts.prefix.length}
              disabled={renameLoading}
              aria-label="Rename room"
            />
            <button
              className="room-rename-close-btn"
              onClick={handleCancelRename}
              disabled={renameLoading}
              title="Cancel renaming"
              aria-label="Cancel renaming"
            >
              <CloseIcon />
            </button>
          </div>
        ) : (
          <span className="room-name">{name}</span>
        )}
        <div className="room-meta">
          <span className={`room-status room-status--${status}`}>
            <span className="room-status-dot"></span>
            {isEnded ? 'ENDED' : 'ACTIVE'}
          </span>
          <span className="room-meta-divider">·</span>
          <span className="room-code-tag" title="Invite code">📋 {code}</span>
          <span className="room-meta-divider">·</span>
          <span className="room-updated">
            {isEnded ? `Ended At: ${timeAgo(endedAt)}` : `Last Activity: ${displayTime}`}
          </span>
          <span className="room-meta-divider">·</span>
          <span className="room-participants">{participants} participants</span>
        </div>
      </div>

      <div className="room-card-right">
        <AvatarGroup participants={participants} />

        {/* Copied toast */}
        {copied && <span className="room-copied-toast">Copied!</span>}

        {/* 3-dot dropdown */}
        <div className="room-dropdown-wrap" ref={dropdownRef}>
          <button
            className="room-more-btn"
            aria-label="Room options"
            onClick={handleMoreClick}
          >
            <MoreIcon />
          </button>

          {dropdownOpen && (
            <div className="room-dropdown">
              <button className="room-dropdown-item" onClick={handleCopyCode}>
                <CopyIcon />
                <span>Copy Code</span>
              </button>
              {isOwner && !isEnded && (
                <button className="room-dropdown-item" onClick={handleStartRename}>
                  <EditIcon />
                  <span>Rename</span>
                </button>
              )}
              {(isOwner || isEnded) && <div className="room-dropdown-divider" />}
              {(isOwner || isEnded) && (
                <button className="room-dropdown-item room-dropdown-item--danger" onClick={handleDelete}>
                  <TrashIcon />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
