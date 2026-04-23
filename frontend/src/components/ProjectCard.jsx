import './ProjectCard.css';

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

const CommitIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <line x1="1.05" y1="12" x2="7" y2="12" />
    <line x1="17.01" y1="12" x2="22.96" y2="12" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const avatarColors = ['#6366F1','#0EA5E9','#F59E0B','#10B981','#EC4899','#8B5CF6'];
const getColor = (char) => avatarColors[char.charCodeAt(0) % avatarColors.length];

const AvatarGroup = ({ count }) => {
  const letters = Array.from({ length: Math.min(count, 3) }, (_, i) =>
    String.fromCharCode(65 + i));
  const extra = count - letters.length;
  return (
    <div className="pc-avatar-group">
      {letters.map((l, i) => (
        <div key={i} className="pc-avatar" style={{ background: getColor(l), zIndex: letters.length - i }}>
          {l}
        </div>
      ))}
      {extra > 0 && <div className="pc-avatar pc-avatar--extra">+{extra}</div>}
    </div>
  );
};

const tagStyles = {
  'High Priority': { bg: '#FEF3C7', color: '#92400E' },
  'Critical':      { bg: '#FEE2E2', color: '#991B1B' },
  'Marketing':     { bg: '#E0F2FE', color: '#0369A1' },
  'Design':        { bg: '#EDE9FE', color: '#5B21B6' },
};

export default function ProjectCard({ project, large = false, empty = false }) {
  if (empty) {
    return (
      <div className="project-card project-card--empty">
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

  const { name, description, tag, activeRooms, commits, collaborators, image } = project;
  const tagStyle = tagStyles[tag] || { bg: '#F3F4F6', color: '#374151' };

  return (
    <div className={`project-card ${large ? 'project-card--large' : ''}`}>
      {image && <div className="project-card-image"><img src={image} alt={name} /></div>}

      <div className="project-card-body">
        {tag && (
          <span className="project-tag" style={{ background: tagStyle.bg, color: tagStyle.color }}>
            {tag}
          </span>
        )}

        <div className="project-card-header-row">
          <h3 className="project-name">{name}</h3>
          <button className="project-more-btn" aria-label="Project options">
            <MoreIcon />
          </button>
        </div>

        <p className="project-description">{description}</p>

        <div className="project-card-footer">
          <div className="project-stats">
            {activeRooms != null && (
              <span className="project-stat">
                <RoomIcon /> {activeRooms} Active Rooms
              </span>
            )}
            {commits != null && (
              <span className="project-stat">
                <CommitIcon /> {commits} Commits
              </span>
            )}
            {activeRooms != null && !commits && (
              <span className="project-stat">
                {activeRooms} ROOMS
              </span>
            )}
          </div>
          <div className="project-card-right">
            {collaborators && <AvatarGroup count={collaborators} />}
            {!commits && !collaborators && (
              <button className="project-arrow-btn"><ArrowIcon /></button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
