import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useUser, getAvatarMeta } from '../context/UserContext';
import { updateProfile, changePassword, deleteAccount } from '../api/users';
import API from '../api/axios';
import './Settings.css';

/* ── Icons ── */
const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LinkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const EyeIcon = ({ show }) => show ? (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
) : (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

/* ── Password strength ── */
const PW_RULES = [
  { id: 'len',   test: (p) => p.length >= 8,    label: '8+ characters' },
  { id: 'upper', test: (p) => /[A-Z]/.test(p),  label: 'Uppercase letter' },
  { id: 'num',   test: (p) => /[0-9]/.test(p),  label: 'Number' },
];

/* ── Main component ─────────────────────────────────── */
export default function SettingsPage() {
  const navigate      = useNavigate();
  const { user, refetch } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();

  /* --- OAuth Connection states --- */
  const [connectionSuccess, setConnectionSuccess] = useState('');
  const [connectionError, setConnectionError]     = useState('');

  /* Detect OAuth linking success / error from query params */
  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');

    if (connected) {
      setConnectionSuccess(`Successfully connected your ${connected === 'github' ? 'GitHub' : 'Google'} account!`);
      searchParams.delete('connected');
      setSearchParams(searchParams, { replace: true });
      refetch();
      setTimeout(() => setConnectionSuccess(''), 5000);
    } else if (error) {
      if (error === 'already_connected') {
        setConnectionError('This social account is already linked to another CodeCall user.');
      } else if (error === 'oauth_failed') {
        setConnectionError('Failed to connect social account. Please try again.');
      } else {
        setConnectionError(decodeURIComponent(error));
      }
      searchParams.delete('error');
      setSearchParams(searchParams, { replace: true });
      setTimeout(() => setConnectionError(''), 5000);
    }
  }, [searchParams, setSearchParams, refetch]);

  const handleConnectOAuth = (provider) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    const BACKEND_URL = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';
    window.location.href = `${BACKEND_URL}/api/auth/${provider}?state=${encodeURIComponent(token)}`;
  };

  /* --- Profile section state --- */
  const [fullName, setFullName]   = useState('');
  const [username, setUsername]   = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError]   = useState('');
  const [usernameStatus, setUsernameStatus] = useState('idle');
  const [profileFieldErrors, setProfileFieldErrors] = useState({});
  const debounceRef = useRef(null);

  /* --- Password section state --- */
  const [currentPwd, setCurrentPwd]   = useState('');
  const [newPwd, setNewPwd]           = useState('');
  const [confirmPwd, setConfirmPwd]   = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [pwSaving, setPwSaving]       = useState(false);
  const [pwSuccess, setPwSuccess]     = useState(false);
  const [pwError, setPwError]         = useState('');

  /* --- Deletion section state --- */
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletePwd, setDeletePwd]                 = useState('');
  const [showDeletePwd, setShowDeletePwd]         = useState(false);
  const [deleteLoading, setDeleteLoading]         = useState(false);
  const [deleteError, setDeleteError]             = useState('');

  /* Populate fields from user context */
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setUsername(user.username || '');
    }
  }, [user]);

  /* ── Username availability check ── */
  const checkUsername = useCallback((value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const norm = value.toLowerCase().trim();
    if (!norm || norm.length < 3 || norm === user?.username) {
      setUsernameStatus('idle');
      return;
    }
    if (!/^[a-z0-9_]{3,30}$/.test(norm)) {
      setUsernameStatus('invalid');
      return;
    }
    setUsernameStatus('checking');
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await API.get(`/auth/check-username/${norm}`);
        setUsernameStatus(res.data.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus('idle');
      }
    }, 500);
  }, [user?.username]);

  /* ── Save Profile ── */
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!fullName.trim() || fullName.trim().length < 2)
      errs.fullName = 'Full name must be at least 2 characters.';
    if (!username || username.length < 3)
      errs.username = 'Username must be at least 3 characters.';
    else if (usernameStatus === 'taken')
      errs.username = 'This username is already taken.';
    else if (usernameStatus === 'checking')
      errs.username = 'Please wait for availability check.';

    setProfileFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess(false);
    try {
      await updateProfile({ fullName: fullName.trim(), username: username.trim() });
      await refetch();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err.response?.data?.message ?? 'Failed to save profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  /* ── Change Password ── */
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPwd !== confirmPwd) {
      setPwError('Passwords do not match.');
      return;
    }

    const allRulesPassed = PW_RULES.every(r => r.test(newPwd));
    if (!allRulesPassed) {
      setPwError('Password does not meet the requirements.');
      return;
    }

    setPwSaving(true);
    setPwError('');
    setPwSuccess(false);
    try {
      await changePassword({
        currentPassword: user?.hasPassword ? currentPwd : undefined,
        newPassword: newPwd,
      });
      setPwSuccess(true);
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      setTimeout(() => setPwSuccess(false), 3000);
      await refetch();
    } catch (err) {
      setPwError(err.response?.data?.message ?? 'Failed to change password.');
    } finally {
      setPwSaving(false);
    }
  };

  /* ── Delete Account ── */
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (user?.hasPassword && !deletePwd) {
      setDeleteError('Please enter your password to confirm deletion.');
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deleteAccount(user?.hasPassword ? deletePwd : undefined);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.setItem('account_deleted', 'true');
      window.location.href = '/login';
    } catch (err) {
      setDeleteError(err.response?.data?.message ?? 'Failed to delete account. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ── Avatar meta ── */
  const displayName = user?.fullName || user?.username || 'User';
  const { initials, bg, text } = getAvatarMeta(displayName, user?.id);

  /* ── Provider status ── */
  const githubConnected = !!user?.githubId;
  const googleConnected = !!user?.googleId;

  return (
    <div className="settings-shell">
      <Navbar />

      <div className="settings-body">

        {/* ── Page header ── */}
        <div className="settings-page-header">
          <button
            className="settings-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <BackIcon /> Back
          </button>
          <h1 className="settings-heading">Account Settings</h1>
          <p className="settings-subheading">
            Manage your profile, connected accounts, and security preferences.
          </p>
        </div>

        {/* ══════════════════════════════════════════
            SECTION 1 — Profile
        ══════════════════════════════════════════ */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon settings-card-icon--blue">
              <ProfileIcon />
            </div>
            <div>
              <p className="settings-card-title">Profile</p>
              <p className="settings-card-desc">Your name, username, and avatar</p>
            </div>
          </div>

          <form className="settings-card-body" onSubmit={handleSaveProfile} noValidate>

            {/* Avatar row */}
            <div className="settings-avatar-row">
              <div className="settings-avatar-circle" style={{ background: bg, color: text }}>
                {user?.avatar
                  ? <img src={user.avatar} alt={displayName} />
                  : initials
                }
              </div>
              <div className="settings-avatar-info">
                <p>{user?.avatar ? 'Avatar from your OAuth provider' : 'Avatar based on your name'}</p>
                <span>Custom avatar upload coming soon</span>
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="settings-info-row">
              <span className="settings-info-label">Email Address</span>
              <span className="settings-info-value">{user?.email || '—'}</span>
            </div>

            {/* Full Name */}
            <div className="settings-field">
              <label className="settings-label" htmlFor="settings-fullname">Full Name</label>
              <input
                id="settings-fullname"
                className={`settings-input ${profileFieldErrors.fullName ? 'settings-input--error' : ''}`}
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setProfileFieldErrors(p => ({ ...p, fullName: null }));
                }}
                placeholder="Your full name"
                disabled={profileSaving}
                autoComplete="name"
              />
              {profileFieldErrors.fullName && (
                <span className="settings-field-error">{profileFieldErrors.fullName}</span>
              )}
            </div>

            {/* Username */}
            <div className="settings-field">
              <label className="settings-label" htmlFor="settings-username">Username</label>
              <input
                id="settings-username"
                className={`settings-input ${
                  profileFieldErrors.username || usernameStatus === 'taken'
                    ? 'settings-input--error'
                    : usernameStatus === 'available'
                    ? '' : ''
                }`}
                style={usernameStatus === 'available' ? { borderColor: '#10B981' } : {}}
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setProfileFieldErrors(p => ({ ...p, username: null }));
                  checkUsername(e.target.value);
                }}
                placeholder="your_username"
                disabled={profileSaving}
                autoComplete="username"
                aria-describedby="username-availability"
              />
              <div
                id="username-availability"
                className={`settings-username-status settings-username-status--${usernameStatus}`}
                aria-live="polite"
              >
                {usernameStatus === 'available' && <><CheckIcon /> Username is available</>}
                {usernameStatus === 'taken'     && <><XIcon /> Username is already taken</>}
                {usernameStatus === 'checking'  && 'Checking availability…'}
                {usernameStatus === 'invalid'   && 'Letters, numbers, and underscores only (3–30 chars)'}
              </div>
              {profileFieldErrors.username && (
                <span className="settings-field-error">{profileFieldErrors.username}</span>
              )}
            </div>

            {/* Banners */}
            {profileError && (
              <div className="settings-banner settings-banner--error" role="alert">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="settings-banner settings-banner--success" role="status">
                <CheckIcon /> Profile saved successfully!
              </div>
            )}

            <button
              id="save-profile-btn"
              type="submit"
              className="settings-save-btn"
              disabled={profileSaving || usernameStatus === 'checking'}
            >
              {profileSaving ? 'Saving…' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* ══════════════════════════════════════════
            SECTION 2 — Connected Accounts
        ══════════════════════════════════════════ */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon settings-card-icon--green">
              <LinkIcon />
            </div>
            <div>
              <p className="settings-card-title">Connected Accounts</p>
              <p className="settings-card-desc">OAuth providers linked to your account</p>
            </div>
          </div>

          <div className="settings-card-body">
            {/* Connection Success/Error Banners */}
            {connectionSuccess && (
              <div className="settings-banner settings-banner--success" style={{ marginBottom: '16px' }} role="status">
                <CheckIcon /> {connectionSuccess}
              </div>
            )}
            {connectionError && (
              <div className="settings-banner settings-banner--error" style={{ marginBottom: '16px' }} role="alert">
                <XIcon /> {connectionError}
              </div>
            )}

            <div className="settings-provider-list">
              {/* GitHub */}
              <div className="settings-provider-row">
                <div className="settings-provider-icon" style={{ background: '#F3F4F6', color: '#111827' }}>
                  <GitHubIcon />
                </div>
                <span className="settings-provider-name">GitHub</span>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`settings-provider-badge ${
                    githubConnected
                      ? 'settings-provider-badge--connected'
                      : 'settings-provider-badge--disconnected'
                  }`}>
                    {githubConnected ? 'Connected' : 'Not connected'}
                  </span>
                  {!githubConnected && (
                    <button
                      type="button"
                      className="settings-connect-btn"
                      onClick={() => handleConnectOAuth('github')}
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>

              {/* Google */}
              <div className="settings-provider-row">
                <div className="settings-provider-icon" style={{ background: '#FEF9EE' }}>
                  <GoogleIcon />
                </div>
                <span className="settings-provider-name">Google</span>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`settings-provider-badge ${
                    googleConnected
                      ? 'settings-provider-badge--connected'
                      : 'settings-provider-badge--disconnected'
                  }`}>
                    {googleConnected ? 'Connected' : 'Not connected'}
                  </span>
                  {!googleConnected && (
                    <button
                      type="button"
                      className="settings-connect-btn"
                      onClick={() => handleConnectOAuth('google')}
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="settings-field-hint">
              OAuth providers cannot be disconnected at this time. Contact support if needed.
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            SECTION 3 — Security / Password
        ══════════════════════════════════════════ */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon settings-card-icon--orange">
              <LockIcon />
            </div>
            <div>
              <p className="settings-card-title">Security</p>
              <p className="settings-card-desc">
                {user?.hasPassword ? 'Change your password' : 'Add a password to your account'}
              </p>
            </div>
          </div>

          <form className="settings-card-body" onSubmit={handleChangePassword} noValidate>

            {/* Account info */}
            <div className="settings-info-row">
              <span className="settings-info-label">Account Created</span>
              <span className="settings-info-value">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })
                  : '—'
                }
              </span>
            </div>

            {/* Current password — only shown for existing-password accounts */}
            {user?.hasPassword && (
              <div className="settings-field">
                <label className="settings-label" htmlFor="settings-current-pwd">
                  Current Password
                </label>
                <div className="settings-pw-input-wrap">
                  <input
                    id="settings-current-pwd"
                    className="settings-input"
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    disabled={pwSaving}
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    className="settings-pw-toggle"
                    onClick={() => setShowCurrent(v => !v)}
                    aria-label={showCurrent ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon show={showCurrent} />
                  </button>
                </div>
              </div>
            )}

            {/* New password */}
            <div className="settings-field">
              <label className="settings-label" htmlFor="settings-new-pwd">
                New Password
              </label>
              <div className="settings-pw-input-wrap">
                <input
                  id="settings-new-pwd"
                  className="settings-input"
                  type={showNew ? 'text' : 'password'}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  disabled={pwSaving}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  className="settings-pw-toggle"
                  onClick={() => setShowNew(v => !v)}
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon show={showNew} />
                </button>
              </div>

              {/* Rules */}
              {newPwd && (
                <ul style={{ listStyle: 'none', padding: 0, margin: '6px 0 0', display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
                  {PW_RULES.map(r => (
                    <li key={r.id} style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      fontSize: '11.5px', fontWeight: 500,
                      color: r.test(newPwd) ? '#10B981' : 'var(--color-text-muted)',
                      transition: 'color 0.2s'
                    }}>
                      {r.test(newPwd) ? <CheckIcon /> : <XIcon />}
                      {r.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm password */}
            <div className="settings-field">
              <label className="settings-label" htmlFor="settings-confirm-pwd">
                Confirm New Password
              </label>
              <input
                id="settings-confirm-pwd"
                className="settings-input"
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                disabled={pwSaving}
              />
            </div>

            {/* Banners */}
            {pwError && (
              <div className="settings-banner settings-banner--error" role="alert">
                {pwError}
              </div>
            )}
            {pwSuccess && (
              <div className="settings-banner settings-banner--success" role="status">
                <CheckIcon /> Password updated successfully!
              </div>
            )}

            <button
              id="save-password-btn"
              type="submit"
              className="settings-save-btn"
              disabled={pwSaving || !newPwd || !confirmPwd}
            >
              {pwSaving ? 'Updating…' : user?.hasPassword ? 'Change Password' : 'Set Password'}
            </button>
          </form>
        </div>

        {/* ══════════════════════════════════════════
            SECTION 4 — Danger Zone (Account Deletion)
        ══════════════════════════════════════════ */}
        <div className="settings-card settings-card--danger" style={{ border: '1px solid #FEE2E2', background: '#FEF2F2' }}>
          <div className="settings-card-header">
            <div className="settings-card-icon settings-card-icon--red" style={{ background: '#FEE2E2', color: '#EF4444' }}>
              <TrashIcon />
            </div>
            <div>
              <p className="settings-card-title" style={{ color: '#991B1B' }}>Danger Zone</p>
              <p className="settings-card-desc" style={{ color: '#B91C1C' }}>Irreversibly delete your account and all data</p>
            </div>
          </div>

          <div className="settings-card-body" style={{ background: '#FFFDFD' }}>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#7F1D1D', marginBottom: '16px', fontWeight: 500 }}>
              Deleting your account is permanent. It will permanently remove your profile details, delete all projects you own, clean up room participations, and delete all of your active friendship connections. This action cannot be undone.
            </p>

            {!deleteConfirmOpen ? (
              <button
                type="button"
                className="settings-delete-trigger-btn"
                onClick={() => {
                  setDeleteConfirmOpen(true);
                  setDeletePwd('');
                  setDeleteError('');
                }}
                style={{
                  background: '#EF4444', color: '#FFFFFF', border: 'none',
                  padding: '10px 16px', borderRadius: '6px', fontSize: '13px',
                  fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#DC2626'}
                onMouseOut={(e) => e.currentTarget.style.background = '#EF4444'}
              >
                Delete Account…
              </button>
            ) : (
              <form onSubmit={handleDeleteAccount} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                {user?.hasPassword ? (
                  <div className="settings-field" style={{ marginBottom: 0 }}>
                    <label className="settings-label" htmlFor="settings-delete-pwd" style={{ color: '#991B1B' }}>
                      Enter your password to verify ownership
                    </label>
                    <div className="settings-pw-input-wrap">
                      <input
                        id="settings-delete-pwd"
                        className="settings-input"
                        type={showDeletePwd ? 'text' : 'password'}
                        value={deletePwd}
                        onChange={(e) => setDeletePwd(e.target.value)}
                        placeholder="Enter password to confirm"
                        disabled={deleteLoading}
                        style={{ paddingRight: '40px', borderColor: '#FCA5A5' }}
                        required
                      />
                      <button
                        type="button"
                        className="settings-pw-toggle"
                        onClick={() => setShowDeletePwd(v => !v)}
                        aria-label={showDeletePwd ? 'Hide password' : 'Show password'}
                        style={{ color: '#F87171' }}
                      >
                        <EyeIcon show={showDeletePwd} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: '#B91C1C', fontWeight: 600 }}>
                    Please confirm that you want to delete your account permanently.
                  </p>
                )}

                {/* Error Banner */}
                {deleteError && (
                  <div className="settings-banner settings-banner--error" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '10px 12px', borderRadius: '6px', fontSize: '12.5px' }} role="alert">
                    {deleteError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                  <button
                    type="submit"
                    className="settings-delete-final-btn"
                    disabled={deleteLoading || (user?.hasPassword && !deletePwd)}
                    style={{
                      background: (user?.hasPassword && !deletePwd) ? '#FCA5A5' : '#DC2626',
                      color: '#FFFFFF', border: 'none', padding: '10px 16px',
                      borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                      cursor: (user?.hasPassword && !deletePwd) ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseOver={(e) => {
                      if (!user?.hasPassword || deletePwd) e.currentTarget.style.background = '#991B1B';
                    }}
                    onMouseOut={(e) => {
                      if (!user?.hasPassword || deletePwd) e.currentTarget.style.background = '#DC2626';
                    }}
                  >
                    {deleteLoading ? 'Deleting Account…' : 'Permanently Delete My Account'}
                  </button>

                  <button
                    type="button"
                    className="settings-delete-cancel-btn"
                    onClick={() => {
                      setDeleteConfirmOpen(false);
                      setDeletePwd('');
                      setDeleteError('');
                    }}
                    disabled={deleteLoading}
                    style={{
                      background: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB',
                      padding: '10px 16px', borderRadius: '6px', fontSize: '13px',
                      fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#E5E7EB'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#F3F4F6'}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
