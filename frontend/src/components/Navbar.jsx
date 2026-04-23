import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';

/* ── Icons ── */
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const GearIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83
      0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4
      0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65
      1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65
      1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65
      1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2
      2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65
      1.65 0 00-1.51 1z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function Navbar({ activePage }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: call /api/auth/logout
    navigate('/login');
  };

  const searchPlaceholder = activePage === 'projects'
    ? 'Search projects…'
    : 'Search rooms…';

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      {/* Left — Logo + Nav */}
      <div className="navbar-left">
        <span className="navbar-logo">CodeCall</span>
        <div className="navbar-tabs" role="tablist">
          <NavLink to="/dashboard" className={({ isActive }) =>
            `navbar-tab ${isActive ? 'navbar-tab--active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) =>
            `navbar-tab ${isActive ? 'navbar-tab--active' : ''}`}>
            Projects
          </NavLink>
          <NavLink to="/rooms" className={({ isActive }) =>
            `navbar-tab ${isActive ? 'navbar-tab--active' : ''}`}>
            Rooms
          </NavLink>
        </div>
      </div>

      {/* Right — Search + Actions */}
      <div className="navbar-right">
        <div className="navbar-search">
          <SearchIcon />
          <input
            type="search"
            placeholder={searchPlaceholder}
            className="navbar-search-input"
            aria-label="Search"
          />
        </div>

        <button className="navbar-icon-btn" aria-label="Notifications">
          <BellIcon />
        </button>
        <button className="navbar-icon-btn" aria-label="Settings">
          <GearIcon />
        </button>

        <div className="navbar-avatar" aria-label="User avatar">
          <UserIcon />
        </div>

        <button className="navbar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
