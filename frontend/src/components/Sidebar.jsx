import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAvatarMeta } from '../context/UserContext';
import { getRecentCollaborators } from '../api/users';
import InviteModal from './InviteModal';
import './Sidebar.css';


/* ── Icons ── */
const UserAddIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);

const HelpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const DocsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-accent)"
    aria-hidden="true">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);

const RetryIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
  </svg>
);

/* ── Skeleton row ── */
function SkeletonRow() {
  return (
    <li className="sidebar-item">
      <div className="sidebar-skeleton-avatar" />
      <div className="sidebar-skeleton-lines">
        <div className="sidebar-skeleton-line sidebar-skeleton-line--name" />
        <div className="sidebar-skeleton-line sidebar-skeleton-line--sub" />
      </div>
    </li>
  );
}

/* ── Collaborator row ── */
function CollaboratorRow({ user }) {
  const displayName = user.fullName || user.username || 'Unknown';
  const { initials, bg, text } = getAvatarMeta(displayName, user.id);

  return (
    <li className="sidebar-item">
      <div
        className="sidebar-avatar-bubble"
        style={{ background: bg, color: text }}
        title={displayName}
        aria-label={displayName}
      >
        {user.avatar
          ? <img src={user.avatar} alt={displayName} className="sidebar-avatar-img" />
          : <span>{initials}</span>
        }
      </div>
      <div className="sidebar-user-info">
        <span className="sidebar-name">{displayName}</span>
        <span className="sidebar-username">@{user.username}</span>
      </div>
    </li>
  );
}

/* ── Sidebar ── */
export default function Sidebar() {
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [isInviteOpen, setIsInviteOpen]   = useState(false);


  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecentCollaborators();
      setCollaborators(data);
    } catch {
      setError('Could not load collaborators.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <aside className="sidebar" aria-label="Active collaborators">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-icon-wrap">
          <UsersIcon />
        </div>
        <div>
          <p className="sidebar-title">Collaborators</p>
          <p className="sidebar-subtitle">RECENT TEAMMATES</p>
        </div>
      </div>

      {/* List */}
      <ul className="sidebar-list" aria-label="Recent collaborators">
        {loading && (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        )}

        {error && !loading && (
          <li className="sidebar-state sidebar-state--error">
            <p>{error}</p>
            <button
              className="sidebar-retry-btn"
              onClick={load}
              aria-label="Retry loading collaborators"
            >
              <RetryIcon /> Retry
            </button>
          </li>
        )}

        {!loading && !error && collaborators.length === 0 && (
          <li className="sidebar-state">
            <div className="sidebar-empty-icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="var(--color-border)" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                <path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <p className="sidebar-empty-text">No collaborators yet</p>
            <p className="sidebar-empty-hint">Create or join a room to start collaborating</p>
          </li>
        )}

        {!loading && !error && collaborators.map((user) => (
          <CollaboratorRow key={user.id} user={user} />
        ))}
      </ul>

      {/* Invite Button */}
      <button
        className="sidebar-invite-btn"
        id="invite-member-btn"
        aria-label="Invite a team member"
        onClick={() => setIsInviteOpen(true)}
      >
        <UserAddIcon />
        Invite Member
      </button>

      {isInviteOpen && (
        <InviteModal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
        />
      )}


      {/* Footer Links */}
      <div className="sidebar-footer">
        <Link to="/help" className="sidebar-link">
          <HelpIcon /> Help Center
        </Link>
        <Link to="/docs" className="sidebar-link">
          <DocsIcon /> API Docs
        </Link>
      </div>
    </aside>
  );
}
