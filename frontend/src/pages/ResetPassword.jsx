import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import './Login.css';
import './Signup.css';

const TerminalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
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

const SuccessIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10B981"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isValid = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)
    && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError('');

    try {
      await API.post('/auth/reset-password', { token, password, confirmPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page" role="main">
      <header className="login-header">
        <div className="logo-bubble"><TerminalIcon /></div>
        <span className="brand-label">CodeCall</span>
        <h1 className="login-heading">{success ? 'Password Reset' : 'Set New Password'}</h1>
        <p className="login-subtitle">
          {success
            ? 'Your password has been updated. Redirecting…'
            : 'Enter your new password below.'}
        </p>
      </header>

      <div className="login-card">
        {success ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <SuccessIcon />
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '16px' }}>
              You'll be redirected to login in a few seconds.
            </p>
            <Link to="/login" className="btn-primary" style={{ marginTop: '20px', textDecoration: 'none', display: 'inline-flex' }}>
              Sign In Now
            </Link>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* New Password */}
            <div className="field-group">
              <label className="field-label" htmlFor="reset-pwd">New Password</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <input id="reset-pwd" className="form-input"
                  type={showPwd ? 'text' : 'password'} autoComplete="new-password"
                  placeholder="••••••••••" value={password}
                  onChange={e => setPassword(e.target.value)} required
                  style={{ paddingRight: '48px' }} />
                <button type="button" onClick={() => setShowPwd(v => !v)} className="pwd-toggle-btn"
                  aria-label={showPwd ? 'Hide' : 'Show'}>
                  <EyeIcon show={showPwd} />
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div className="field-group">
              <label className="field-label" htmlFor="reset-confirm">Confirm Password</label>
              <div className="input-wrapper">
                <input id="reset-confirm" className={`form-input ${confirmPassword && password !== confirmPassword ? 'form-input--error' : ''}`}
                  type="password" autoComplete="new-password"
                  placeholder="••••••••••" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <span className="field-error">Passwords do not match.</span>
              )}
            </div>

            {error && (
              <div className="form-error" role="alert">
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

            <button type="submit" className="btn-primary" disabled={loading || !isValid}>
              {loading ? (
                <><span className="spinner" /> Resetting…</>
              ) : 'Reset Password'}
            </button>

            <p className="register-hint">
              <Link to="/login">Back to Sign In</Link>
            </p>
          </form>
        )}
      </div>

      <footer className="login-footer">
        <p>
          © 2026 CodeCall Inc. &nbsp;·&nbsp;
          <Link to="/privacy">Privacy</Link> &nbsp;·&nbsp;
          <Link to="/terms">Terms</Link> &nbsp;·&nbsp;
          <Link to="/security">Security</Link>
        </p>
      </footer>
    </main>
  );
}
