import './RoomCard.css';

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="19" r="1" fill="currentColor" />
  </svg>
);

/* Deterministic avatar color from name */
const avatarColors = ['#6366F1','#0EA5E9','#F59E0B','#10B981','#EC4899','#8B5CF6'];
const getAvatarColor = (name) =>
  avatarColors[name.charCodeAt(0) % avatarColors.length];

const AvatarGroup = ({ participants }) => {
  const names = Array.from({ length: Math.min(participants, 3) }, (_, i) =>
    String.fromCharCode(65 + i)
  );
  const extra = participants - names.length;

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
  { icon: GearSvg,     color: '#3B82F6' },
  { icon: ShieldSvg,   color: '#F97316' },
];

export default function RoomCard({ room, index = 0 }) {
  const { name, status, lastUpdated, participants } = room;
  const { icon, color } = iconCycle[index % iconCycle.length];

  return (
    <div className="room-card">
      <RoomIcon color={color} icon={icon} />

      <div className="room-info">
        <span className="room-name">{name}</span>
        <div className="room-meta">
          <span className={`room-status room-status--${status}`}>
            {status === 'active' ? '● ACTIVE' : 'OFFLINE'}
          </span>
          <span className="room-meta-divider">·</span>
          <span className="room-updated">{lastUpdated}</span>
          <span className="room-meta-divider">·</span>
          <span className="room-participants">{participants} participants</span>
        </div>
      </div>

      <div className="room-card-right">
        <AvatarGroup participants={participants} />
        <button className="room-more-btn" aria-label="Room options">
          <MoreIcon />
        </button>
      </div>
    </div>
  );
}
