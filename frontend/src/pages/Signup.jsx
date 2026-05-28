import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import './Login.css';
import './Signup.css';

/* ─── Icons ─────────────────────────────────────────── */
const TerminalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
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

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ─── Password strength rules ─────────────────────── */
const PW_RULES = [
  { id: 'len', test: (p) => p.length >= 8, label: '8+ characters' },
  { id: 'upper', test: (p) => /[A-Z]/.test(p), label: 'Uppercase letter' },
  { id: 'num', test: (p) => /[0-9]/.test(p), label: 'Number' },
];

function getStrength(pw) {
  const passed = PW_RULES.filter(r => r.test(pw)).length;
  if (passed === 0) return { level: 0, label: '', color: '#6B7280' };
  if (passed === 1) return { level: 1, label: 'Weak', color: '#EF4444' };
  if (passed === 2) return { level: 2, label: 'Fair', color: '#F59E0B' };
  return { level: 3, label: 'Strong', color: '#10B981' };
}

/* ─── Component ──────────────────────────────────── */
export default function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '', username: '', email: '', password: '', confirmPassword: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setFieldErrors(prev => ({ ...prev, [field]: null }));
    if (error) setError('');
  };

  const strength = getStrength(form.password);

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required.';
    if (form.username.length < 3) errs.username = 'Min 3 characters.';
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) errs.username = 'Letters, numbers, underscores only.';
    if (!form.email.includes('@')) errs.email = 'Enter a valid email.';
    if (strength.level < 3) errs.password = 'Meet all password requirements.';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/register', form);
      const { accessToken, refreshToken } = res.data;
      if (accessToken)  localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page" role="main">
      <header className="login-header">
        <div className="logo-bubble"><TerminalIcon /></div>
        <span className="brand-label">CodeCall Enterprise</span>
        <h1 className="login-heading">Create Account</h1>
        <p className="login-subtitle">Register for your secure development environment.</p>
      </header>

      <div className="login-card">
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="field-group">
            <label className="field-label" htmlFor="signup-name">Full Name</label>
            <div className="input-wrapper">
              <input id="signup-name" className={`form-input ${fieldErrors.fullName ? 'form-input--error' : ''}`}
                type="text" autoComplete="name" placeholder="Jane Doe"
                value={form.fullName} onChange={set('fullName')} required />
            </div>
            {fieldErrors.fullName && <span className="field-error">{fieldErrors.fullName}</span>}
          </div>

          {/* Username */}
          <div className="field-group">
            <label className="field-label" htmlFor="signup-user">Username</label>
            <div className="input-wrapper">
              <input id="signup-user" className={`form-input ${fieldErrors.username ? 'form-input--error' : ''}`}
                type="text" autoComplete="username" placeholder="jane_doe"
                value={form.username} onChange={set('username')} required />
            </div>
            {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
          </div>

          {/* Email */}
          <div className="field-group">
            <label className="field-label" htmlFor="signup-email">Email Address</label>
            <div className="input-wrapper">
              <input id="signup-email" className={`form-input ${fieldErrors.email ? 'form-input--error' : ''}`}
                type="email" autoComplete="email" placeholder="jane@codecall.io"
                value={form.email} onChange={set('email')} required />
            </div>
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>

          {/* Password */}
          <div className="field-group">
            <label className="field-label" htmlFor="signup-pwd">Password</label>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <input id="signup-pwd" className={`form-input ${fieldErrors.password ? 'form-input--error' : ''}`}
                type={showPwd ? 'text' : 'password'} autoComplete="new-password" placeholder="••••••••••"
                value={form.password} onChange={set('password')} required
                style={{ paddingRight: '48px' }} />
              <button type="button" onClick={() => setShowPwd(v => !v)} className="pwd-toggle-btn"
                aria-label={showPwd ? 'Hide password' : 'Show password'}>
                <EyeIcon show={showPwd} />
              </button>
            </div>

            {/* Strength bar */}
            {form.password && (
              <div className="pw-strength">
                <div className="pw-bar-track">
                  <div className="pw-bar-fill" style={{
                    width: `${(strength.level / 3) * 100}%`,
                    background: strength.color,
                  }} />
                </div>
                <span className="pw-strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}

            {/* Rules */}
            {form.password && (
              <ul className="pw-rules">
                {PW_RULES.map(r => (
                  <li key={r.id} className={`pw-rule ${r.test(form.password) ? 'pw-rule--pass' : ''}`}>
                    {r.test(form.password) ? <CheckIcon /> : <XIcon />}
                    {r.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Confirm Password */}
          <div className="field-group">
            <label className="field-label" htmlFor="signup-confirm">Confirm Password</label>
            <div className="input-wrapper">
              <input id="signup-confirm" className={`form-input ${fieldErrors.confirmPassword ? 'form-input--error' : ''}`}
                type="password" autoComplete="new-password" placeholder="••••••••••"
                value={form.confirmPassword} onChange={set('confirmPassword')} required />
            </div>
            {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
          </div>

          {/* Error banner */}
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

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <><span className="spinner" aria-hidden="true" /> Creating Account…</>
            ) : 'Create Account'}
          </button>

          <p className="register-hint">
            Already have an account?&nbsp;
            <Link to="/login">Sign In</Link>
          </p>
        </form>
      </div>

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
