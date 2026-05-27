import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import './Login.css';
import API from '../api/axios';

// ─── Backend URL (used only for OAuth redirects — not Axios) ─────────────────
const BACKEND_URL = 'http://localhost:5000';

/* ─── Inline SVG Icons ───────────────────────────── */
const TerminalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483
      0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462
      -.908-.62.069-.608.069-.608 1.004.07 1.532 1.031 1.532 1.031.892 1.53 2.341 1.088 2.91.832
      .092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.111-4.555-4.943 0-1.091.39-1.984 1.029-2.682
      -.103-.253-.446-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004
      1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.376.203 2.394.1 2.646.64.698
      1.028 1.591 1.028 2.682 0 3.841-2.337 4.687-4.565 4.934.359.309.678.919.678 1.852 0 1.337
      -.012 2.416-.012 2.744 0 .268.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const EyeIcon = ({ show }) => show ? (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
) : (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

/* ─── Component ──────────────────────────────────── */
export default function LoginPage() {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [oauthLoading, setOAuthLoading] = useState(''); // 'github' | 'google' | ''
  const [error, setError]         = useState('');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Display OAuth errors passed back from the backend redirect
  useEffect(() => {
    const err = searchParams.get('error');
    if (err === 'oauth_failed') {
      setError('OAuth authentication failed. Please try again or use email/password.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/auth/login', { email, password });
      const { accessToken, refreshToken } = response.data;
      if (accessToken)  localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      navigate('/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.message ??
        (err.request ? 'Unable to reach the server. Check your connection.' : err.message) ??
        'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initiates the OAuth flow by doing a full-page redirect to the backend.
   * We use window.location.href (not Axios) because the backend
   * redirects to the provider's consent screen.
   */
  const handleOAuth = (provider) => {
    setError('');
    setOAuthLoading(provider);
    // Short delay so the loading state is visible before the browser navigates
    setTimeout(() => {
      window.location.href = `${BACKEND_URL}/api/auth/${provider}`;
    }, 150);
  };

  const isOAuthBusy = oauthLoading !== '';

  return (
    <main className="login-page" role="main">

      {/* ── Header ── */}
      <header className="login-header">
        <div className="logo-bubble" aria-label="CodeCall logo">
          <TerminalIcon />
        </div>
        <span className="brand-label">CodeCall Enterprise</span>
        <h1 className="login-heading">Access the Terminal</h1>
        <p className="login-subtitle">Sign in to your secure development environment.</p>
      </header>

      {/* ── Card ── */}
      <div className="login-card" role="region" aria-label="Login form">
        <form
          className="login-form"
          onSubmit={handleSubmit}
          noValidate
          aria-label="Sign in form"
        >
          {/* Email */}
          <div className="field-group">
            <label className="field-label" htmlFor="email-input">Email Address</label>
            <div className="input-wrapper">
              <input
                id="email-input"
                className="form-input"
                type="email"
                autoComplete="email"
                placeholder="architect@codecall.io"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                aria-required="true"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="field-group">
            <div className="field-label-row">
              <label className="field-label" htmlFor="password-input">Password</label>
              <Link to="/forgot-password" className="recovery-link" aria-label="Recover your password">
                Recovery
              </Link>
            </div>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <input
                id="password-input"
                className="form-input"
                type={showPwd ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                aria-required="true"
                disabled={loading}
                style={{ paddingRight: '48px' }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                aria-label={showPwd ? 'Hide password' : 'Show password'}
                disabled={loading}
                style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)',
                  display: 'flex', alignItems: 'center', padding: '4px',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
              >
                <EyeIcon show={showPwd} />
              </button>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="form-error" role="alert" aria-live="assertive">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            id="sign-in-btn"
            type="submit"
            className="btn-primary"
            disabled={loading || isOAuthBusy}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Authenticating…
              </>
            ) : 'Sign In'}
          </button>

          {/* Register hint */}
          <p className="register-hint">
            New to the platform?&nbsp;
            <Link to="/signup" aria-label="Request platform credentials">Request Credentials</Link>
          </p>
        </form>
      </div>

      {/* ── Secondary Auth ── */}
      <section className="alt-auth-section" aria-label="Alternative authentication methods">
        <span className="alt-auth-label">Or continue with</span>
        <div className="alt-auth-row">

          {/* GitHub */}
          <button
            id="github-auth-btn"
            type="button"
            className={`btn-alt btn-alt--github ${oauthLoading === 'github' ? 'btn-alt--loading' : ''}`}
            aria-label="Continue with GitHub"
            aria-busy={oauthLoading === 'github'}
            disabled={isOAuthBusy || loading}
            onClick={() => handleOAuth('github')}
          >
            {oauthLoading === 'github' ? (
              <><span className="spinner spinner--sm" aria-hidden="true" />Connecting…</>
            ) : (
              <><GitHubIcon />Continue with GitHub</>
            )}
          </button>

          {/* Google */}
          <button
            id="google-auth-btn"
            type="button"
            className={`btn-alt btn-alt--google ${oauthLoading === 'google' ? 'btn-alt--loading' : ''}`}
            aria-label="Continue with Google"
            aria-busy={oauthLoading === 'google'}
            disabled={isOAuthBusy || loading}
            onClick={() => handleOAuth('google')}
          >
            {oauthLoading === 'google' ? (
              <><span className="spinner spinner--sm" aria-hidden="true" />Connecting…</>
            ) : (
              <><GoogleIcon />Continue with Google</>
            )}
          </button>

        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="login-footer">
        <p>
          © 2026 CodeCall Inc. &nbsp;·&nbsp;
          <a href="#privacy">Privacy</a> &nbsp;·&nbsp;
          <a href="#terms">Terms</a> &nbsp;·&nbsp;
          <a href="#security">Security</a>
        </p>
      </footer>

    </main>
  );
}
