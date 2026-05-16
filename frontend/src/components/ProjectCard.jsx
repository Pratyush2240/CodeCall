import './ProjectCard.css';

/* ── Icons ── */
const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="19" cy="12" r="1" fill="currentColor" />
  </svg>
);

const RoomIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <polyline points="4 17 10 11 4 5" strokeWidth="2.5"/>
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

const UsersIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const tagColors = [
  { bg: '#EFF6FF', color: '#1D4ED8' },
  { bg: '#FEF3C7', color: '#92400E' },
  { bg: '#FEE2E2', color: '#991B1B' },
  { bg: '#E0F2FE', color: '#0369A1' },
  { bg: '#EDE9FE', color: '#5B21B6' },
  { bg: '#ECFDF5', color: '#065F46' },
  { bg: '#FFF7ED', color: '#9A3412' },
];

function getTagStyle(tag) {
  const idx = tag.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % tagColors.length;
  return tagColors[idx];
}

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

export default function ProjectCard({ project, onClick, onDelete, empty = false }) {
  if (empty) {
    return (
      <div className="project-card project-card--empty" onClick={onClick} role="button" tabIndex={0}>
        <div className="project-card-empty-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round"
            strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <p className="project-card-empty-title">Create another project</p>
        <p className="project-card-empty-sub">Start a new collaboration workspace</p>
      </div>
    );
  }

  const { name, description, tags = [], roomCount = 0, memberCount = 0, updatedAt } = project;

  const handleMoreClick = (e) => {
    e.stopPropagation();
    if (onDelete && window.confirm(`Delete project "${name}"?`)) {
      onDelete();
    }
  };

  return (
    <div className="project-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="project-card-body">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="project-tags">
            {tags.slice(0, 3).map((tag) => {
              const style = getTagStyle(tag);
              return (
                <span key={tag} className="project-tag" style={{ background: style.bg, color: style.color }}>
                  {tag}
                </span>
              );
            })}
          </div>
        )}

        <div className="project-card-header-row">
          <h3 className="project-name">{name}</h3>
          <button className="project-more-btn" onClick={handleMoreClick} aria-label="Project options">
            <MoreIcon />
          </button>
        </div>

        {description && <p className="project-description">{description}</p>}

        <div className="project-card-footer">
          <div className="project-stats">
            <span className="project-stat">
              <RoomIcon /> {roomCount} {roomCount === 1 ? 'Room' : 'Rooms'}
            </span>
            <span className="project-stat">
              <UsersIcon /> {memberCount} {memberCount === 1 ? 'Member' : 'Members'}
            </span>
          </div>
          <div className="project-card-right">
            {updatedAt && (
              <span className="project-time">{timeAgo(updatedAt)}</span>
            )}
            <button className="project-arrow-btn" tabIndex={-1}>
              <ArrowIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
