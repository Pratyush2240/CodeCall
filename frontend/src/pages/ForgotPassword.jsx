import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import './Login.css';
import './Signup.css';

const TerminalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

const MailIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10B981"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <polyline points="22 6 12 13 2 6" />
  </svg>
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) return;

    setLoading(true);
    setError('');

    try {
      await API.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page" role="main">
      <header className="login-header">
        <div className="logo-bubble"><TerminalIcon /></div>
        <span className="brand-label">CodeCall</span>
        <h1 className="login-heading">Password Recovery</h1>
        <p className="login-subtitle">
          {sent
            ? 'Check your inbox for the reset link.'
            : 'Enter your email to receive a password reset link.'}
        </p>
      </header>

      <div className="login-card">
        {sent ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <MailIcon />
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '16px', lineHeight: '1.6' }}>
              If an account exists for <strong>{email}</strong>, we've sent a reset link.
              <br />The link expires in <strong>30 minutes</strong>.
            </p>
            <Link to="/login" className="btn-primary" style={{ marginTop: '20px', textDecoration: 'none', display: 'inline-flex' }}>
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <label className="field-label" htmlFor="forgot-email">Email Address</label>
              <div className="input-wrapper">
                <input id="forgot-email" className="form-input" type="email" autoComplete="email"
                  placeholder="you@codecall.io" value={email} onChange={e => setEmail(e.target.value)}
                  required autoFocus />
              </div>
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

            <button type="submit" className="btn-primary" disabled={loading || !email.includes('@')}>
              {loading ? (
                <><span className="spinner" /> Sending…</>
              ) : 'Send Reset Link'}
            </button>

            <p className="register-hint">
              Remember your password?&nbsp;
              <Link to="/login">Sign In</Link>
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
