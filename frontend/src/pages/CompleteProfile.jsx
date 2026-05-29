import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import './Login.css';
import './CompleteProfile.css';
import { useUser } from '../context/UserContext';

/* ─── Icons ────────────────────────────────────────── */
const TerminalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

const CheckIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const EyeIcon = ({ show }) => show ? (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
) : (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V11a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm-3 5a3 3 0 016 0v3H9V6z"/>
  </svg>
);

/* ─── Password rules ───────────────────────────────── */
const PW_RULES = [
  { id: 'len',   test: (p) => p.length >= 8,    label: '8+ characters' },
  { id: 'upper', test: (p) => /[A-Z]/.test(p),  label: 'Uppercase letter' },
  { id: 'num',   test: (p) => /[0-9]/.test(p),  label: 'Number' },
];

function getStrength(pw) {
  const passed = PW_RULES.filter(r => r.test(pw)).length;
  if (passed === 0) return { level: 0, label: '',       color: '#6B7280' };
  if (passed === 1) return { level: 1, label: 'Weak',   color: '#EF4444' };
  if (passed === 2) return { level: 2, label: 'Fair',   color: '#F59E0B' };
  return             { level: 3, label: 'Strong', color: '#10B981' };
}

/* ─── Component ────────────────────────────────────── */
export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const { user, loading: loadingMe, refetch } = useUser();

  /* User data derived from global context */
  const oauthAvatar = user?.avatar || null;
  const oauthFullName = user?.fullName || '';

  /* Form state */
  const [fullName, setFullName]           = useState('');
  const [username, setUsername]           = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPwd, setConfirmPwd]       = useState('');
  const [showPwd, setShowPwd]             = useState(false);

  /* Status */
  const [usernameStatus, setUsernameStatus] = useState('idle');
  const [fieldErrors, setFieldErrors]     = useState({});
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);

  const debounceRef = useRef(null);
  const strength    = getStrength(password);

  /* Initialize form state when user loaded */
  useEffect(() => {
    if (user) {
      if (user.isProfileComplete && user.hasPassword) {
        navigate('/dashboard', { replace: true });
        return;
      }
      setFullName(user.fullName || '');
      setUsername(user.username || '');
    }
  }, [user, navigate]);

  /* Redirect if not authenticated */
  useEffect(() => {
    if (!loadingMe && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loadingMe, navigate]);

  /* Reactive redirect on successful profile complete */
  useEffect(() => {
    if (user?.isProfileComplete && user?.hasPassword) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  /* Debounced username check */
  const checkUsername = useCallback((value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const norm = value.toLowerCase().trim();
    if (!norm || norm.length < 3) { setUsernameStatus('idle'); return; }
    if (!/^[a-z0-9_]{3,30}$/.test(norm)) { setUsernameStatus('invalid'); return; }
    setUsernameStatus('checking');
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await API.get(`/auth/check-username/${norm}`);
        setUsernameStatus(res.data.available ? 'available' : 'taken');
      } catch { setUsernameStatus('idle'); }
    }, 500);
  }, []);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    setFieldErrors(p => ({ ...p, username: null }));
    checkUsername(e.target.value);
  };

  /* Validate */
  const validate = () => {
    const errs = {};
    if (!fullName.trim() || fullName.trim().length < 2)
      errs.fullName = 'Full name must be at least 2 characters.';
    if (!username || username.length < 3)
      errs.username = 'Username must be at least 3 characters.';
    else if (!/^[a-zA-Z0-9_]+$/.test(username))
      errs.username = 'Letters, numbers, and underscores only.';
    else if (usernameStatus === 'taken')
      errs.username = 'This username is already taken.';
    else if (usernameStatus === 'checking')
      errs.username = 'Please wait for the username check.';

    // Password is now mandatory for everyone during onboarding
    if (!password) {
      errs.password = 'Password is required.';
    } else if (strength.level < 3) {
      errs.password = 'Meet all password requirements.';
    }

    if (!confirmPwd) {
      errs.confirmPwd = 'Confirm password is required.';
    } else if (password !== confirmPwd) {
      errs.confirmPwd = 'Passwords do not match.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');
    try {
      await API.post('/auth/complete-profile', {
        fullName: fullName.trim(),
        username: username.trim(),
        password,
        confirmPassword: confirmPwd,
      });
      await refetch();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const avatarInitial = (oauthFullName || fullName || 'U').charAt(0).toUpperCase();

  /* Loading state */
  if (loadingMe) {
    return (
      <main className="login-page" role="main" aria-label="Loading profile">
        <div className="oauth-callback-card">
          <div className="oauth-spinner-wrapper" aria-hidden="true">
            <span className="oauth-ring" />
          </div>
          <h1 className="oauth-callback-title">Loading your profile…</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="login-page" role="main">
      <header className="login-header">
        <div className="logo-bubble" aria-label="CodeCall logo">
          <TerminalIcon />
        </div>
        <div className="onboarding-step">
          <span className="onboarding-step-dot" />
          One last step
        </div>
        <h1 className="login-heading">Complete Your Profile</h1>
        <p className="login-subtitle">
          Finish setting up your account credentials to get started.
        </p>
      </header>

      <div className="login-card">
        <form className="login-form" onSubmit={handleSubmit} noValidate>

          {/* Avatar */}
          <div className="onboarding-avatar-wrapper">
            {oauthAvatar ? (
              <img src={oauthAvatar} alt="Profile picture" className="onboarding-avatar" />
            ) : (
              <div className="onboarding-avatar-placeholder">{avatarInitial}</div>
            )}
            {oauthAvatar && (
              <span className="onboarding-avatar-hint">Profile picture from your provider</span>
            )}
          </div>

          {/* Full Name */}
          <div className="field-group">
            <label className="field-label" htmlFor="cp-fullname">Full Name</label>
            <div className="input-wrapper">
              <input
                id="cp-fullname"
                className={`form-input ${fieldErrors.fullName ? 'form-input--error' : ''}`}
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                value={fullName}
                onChange={e => { setFullName(e.target.value); setFieldErrors(p => ({ ...p, fullName: null })); }}
                required
                disabled={loading}
              />
            </div>
            {fieldErrors.fullName && <span className="field-error">{fieldErrors.fullName}</span>}
          </div>

          {/* Username */}
          <div className="field-group">
            <label className="field-label" htmlFor="cp-username">Username</label>
            <div className="input-wrapper">
              <input
                id="cp-username"
                className={`form-input ${
                  fieldErrors.username || usernameStatus === 'taken' || usernameStatus === 'invalid'
                    ? 'form-input--error' : ''
                }`}
                style={usernameStatus === 'available' ? { borderColor: '#10B981' } : {}}
                type="text"
                autoComplete="username"
                placeholder="jane_doe"
                value={username}
                onChange={handleUsernameChange}
                required
                disabled={loading}
              />
            </div>

            <div className={`username-status ${usernameStatus !== 'idle' ? `username-status--${usernameStatus}` : ''}`}
              aria-live="polite">
              {usernameStatus === 'checking'  && <><span className="username-checking-dot" />Checking availability…</>}
              {usernameStatus === 'available' && <><CheckIcon size={12} />Username is available</>}
              {usernameStatus === 'taken'     && <><XIcon size={12} />Username is already taken</>}
              {usernameStatus === 'invalid'   && <><XIcon size={12} />Letters, numbers, and underscores only (3–30 chars)</>}
            </div>
            {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
          </div>

          {/* Mandatory password section */}
          <div className="pw-section-body" style={{ borderTop: '1px solid var(--color-border)', marginTop: '24px', paddingTop: '16px' }}>
            <div className="field-group" style={{ marginBottom: '16px' }}>
              <label className="field-label" htmlFor="cp-password">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <LockIcon /> Choose Password
                </span>
              </label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <input
                  id="cp-password"
                  className={`form-input ${fieldErrors.password ? 'form-input--error' : ''}`}
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: null })); }}
                  style={{ paddingRight: '48px' }}
                  disabled={loading}
                  required
                />
                <button type="button" className="pwd-toggle-btn"
                  onClick={() => setShowPwd(v => !v)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}>
                  <EyeIcon show={showPwd} />
                </button>
              </div>
              {password && (
                <>
                  <div className="pw-strength">
                    <div className="pw-bar-track">
                      <div className="pw-bar-fill" style={{ width: `${(strength.level / 3) * 100}%`, background: strength.color }} />
                    </div>
                    <span className="pw-strength-label" style={{ color: strength.color }}>{strength.label}</span>
                  </div>
                  <ul className="pw-rules">
                    {PW_RULES.map(r => (
                      <li key={r.id} className={`pw-rule ${r.test(password) ? 'pw-rule--pass' : ''}`}>
                        {r.test(password) ? <CheckIcon /> : <XIcon />}{r.label}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            </div>

            <div className="field-group" style={{ marginBottom: 0 }}>
              <label className="field-label" htmlFor="cp-confirm">Confirm Password</label>
              <div className="input-wrapper">
                <input
                  id="cp-confirm"
                  className={`form-input ${fieldErrors.confirmPwd ? 'form-input--error' : ''}`}
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••••"
                  value={confirmPwd}
                  onChange={e => { setConfirmPwd(e.target.value); setFieldErrors(p => ({ ...p, confirmPwd: null })); }}
                  disabled={loading}
                  required
                />
              </div>
              {fieldErrors.confirmPwd && <span className="field-error">{fieldErrors.confirmPwd}</span>}
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="form-error" role="alert" style={{ marginTop: '16px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button
            id="complete-profile-btn"
            type="submit"
            className="btn-primary"
            disabled={loading || usernameStatus === 'checking'}
            style={{ marginTop: '24px' }}
          >
            {loading ? <><span className="spinner" aria-hidden="true" />Saving Profile…</> : 'Complete Profile & Enter'}
          </button>
        </form>
      </div>

      <footer className="login-footer">
        <p>© 2026 CodeCall Inc. &nbsp;·&nbsp;<a href="#privacy">Privacy</a> &nbsp;·&nbsp;<a href="#terms">Terms</a></p>
      </footer>
    </main>
  );
}
