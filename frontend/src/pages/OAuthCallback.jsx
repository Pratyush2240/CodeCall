import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Login.css';

/**
 * OAuthCallback
 *
 * Landing page for /oauth/callback — the backend redirects here with:
 *   ?token=<AT>&refresh=<RT>        → returning user → /dashboard
 *   ?token=<AT>&refresh=<RT>&new=1  → new user       → /complete-profile
 */
export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing authentication…');

  useEffect(() => {
    const token   = searchParams.get('token');
    const refresh = searchParams.get('refresh');
    const isNew   = searchParams.get('new') === '1';

    if (!token || !refresh) {
      setStatus('Authentication failed. Redirecting…');
      const t = setTimeout(() => navigate('/login?error=oauth_failed', { replace: true }), 1500);
      return () => clearTimeout(t);
    }

    try {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refresh);

      if (isNew) {
        setStatus('Account created! Setting up your profile…');
        navigate('/complete-profile', { replace: true });
      } else {
        setStatus('Welcome back! Redirecting to dashboard…');
        navigate('/dashboard', { replace: true });
      }
    } catch {
      setStatus('Unable to save session. Redirecting…');
      const t = setTimeout(() => navigate('/login?error=oauth_failed', { replace: true }), 1500);
      return () => clearTimeout(t);
    }
  }, [navigate, searchParams]);

  return (
    <main className="login-page" role="main" aria-label="OAuth authentication callback">
      <div className="oauth-callback-card">
        <div className="oauth-spinner-wrapper" aria-hidden="true">
          <span className="oauth-ring" />
        </div>
        <h1 className="oauth-callback-title">Completing Sign In</h1>
        <p className="oauth-callback-status" aria-live="polite">{status}</p>
      </div>
    </main>
  );
}
