import { useRef, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser, getAvatarMeta } from '../context/UserContext';
import ConfirmModal from './ConfirmModal';
import API from '../api/axios';
import './Navbar.css';

/* ── Icons ─────────────────────────────────────────── */
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const GearIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

/* ── Component ──────────────────────────────────────── */
export default function Navbar({ activePage }) {
  const { user }              = useUser();
  const navigate              = useNavigate();
  const [open, setOpen]       = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef           = useRef(null);

  const searchPlaceholder = activePage === 'projects' ? 'Search projects…' : 'Search rooms…';

  /* ── Avatar meta ── */
  const displayName = user?.fullName || user?.username || '';
  const { initials, bg, text } = getAvatarMeta(displayName, user?.id);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  /* ── Close on Escape ── */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  /* ── Logout handler ── */
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await API.post('/auth/logout', { refreshToken });
      }
    } catch {
      // Ignore — clear tokens regardless
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/login', { replace: true });
    }
  };

  return (
    <>
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

          {/* ── Avatar + Dropdown ── */}
          <div className="navbar-user-menu" ref={dropdownRef}>
            <button
              id="navbar-avatar-btn"
              className="navbar-avatar-btn"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-haspopup="menu"
              aria-label="Open user menu"
              style={{ '--avatar-bg': bg, '--avatar-text': text }}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={displayName}
                  className="navbar-avatar-img"
                />
              ) : (
                <span className="navbar-avatar-initials">{initials}</span>
              )}
              <span className="navbar-avatar-chevron">
                <ChevronDown />
              </span>
            </button>

            {open && (
              <div
                className="navbar-dropdown"
                role="menu"
                aria-label="User menu"
              >
                {/* User info header */}
                <div className="navbar-dropdown-header">
                  <div
                    className="navbar-dropdown-avatar"
                    style={{ background: bg, color: text }}
                  >
                    {user?.avatar
                      ? <img src={user.avatar} alt={displayName} className="navbar-avatar-img" />
                      : <span>{initials}</span>
                    }
                  </div>
                  <div className="navbar-dropdown-info">
                    <span className="navbar-dropdown-name">
                      {user?.fullName || user?.username || 'User'}
                    </span>
                    <span className="navbar-dropdown-email">
                      {user?.email || ''}
                    </span>
                  </div>
                </div>

                <div className="navbar-dropdown-divider" />

                {/* Menu items */}
                <button
                  className="navbar-dropdown-item"
                  role="menuitem"
                  onClick={() => { setOpen(false); navigate('/settings'); }}
                >
                  <ProfileIcon />
                  Profile
                </button>

                <button
                  className="navbar-dropdown-item"
                  role="menuitem"
                  onClick={() => { setOpen(false); navigate('/settings'); }}
                >
                  <GearIcon />
                  Settings
                </button>

                <div className="navbar-dropdown-divider" />

                <button
                  id="logout-menu-btn"
                  className="navbar-dropdown-item navbar-dropdown-item--danger"
                  role="menuitem"
                  onClick={() => { setOpen(false); setShowLogout(true); }}
                >
                  <LogoutIcon />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Logout Confirmation ── */}
      {showLogout && (
        <ConfirmModal
          title="Logout"
          message="Are you sure you want to logout? You'll need to sign in again to access your workspace."
          confirmLabel="Logout"
          cancelLabel="Cancel"
          danger
          loading={loggingOut}
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </>
  );
}
