import './Sidebar.css';

/* ── Icons ── */
const PersonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const BotIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" strokeWidth="3" strokeLinecap="round"/>
    <line x1="16" y1="16" x2="16" y2="16" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const UserAddIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);

const HelpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const DocsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const collaborators = [
  { name: 'Alex Rivers',   status: 'online',  isBot: false },
  { name: 'Sarah Chen',    status: 'offline', isBot: false },
  { name: 'Jordan Smith',  status: 'offline', isBot: false },
  { name: 'Dev Bot',       status: 'offline', isBot: true  },
  { name: 'Guest User',    status: 'offline', isBot: false },
];

export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Active collaborators">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-icon-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-accent)"
            aria-hidden="true">
            <path d="M12 2l2.09 6.26H21l-5.47 3.97 2.09 6.26L12 14.52l-5.62 3.97
              2.09-6.26L3 8.26h6.91z"/>
          </svg>
        </div>
        <div>
          <p className="sidebar-title">Active Collaborators</p>
          <p className="sidebar-subtitle">LIVE IN WORKSPACE</p>
        </div>
      </div>

      {/* Collaborator List */}
      <ul className="sidebar-list">
        {collaborators.map((c) => (
          <li key={c.name} className="sidebar-item">
            <div className="sidebar-person-icon">
              {c.isBot ? <BotIcon /> : <PersonIcon />}
            </div>
            <span className="sidebar-name">{c.name}</span>
            <div className="sidebar-item-right">
              {c.isBot && <span className="sidebar-badge">AI</span>}
              {c.status === 'online' && (
                <span className="sidebar-dot sidebar-dot--online" aria-label="Online" />
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Invite Button */}
      <button className="sidebar-invite-btn" id="invite-member-btn">
        <UserAddIcon />
        Invite Member
      </button>

      {/* Footer Links */}
      <div className="sidebar-footer">
        <a href="#help" className="sidebar-link">
          <HelpIcon /> Help Center
        </a>
        <a href="#docs" className="sidebar-link">
          <DocsIcon /> API Docs
        </a>
      </div>
    </aside>
  );
}
