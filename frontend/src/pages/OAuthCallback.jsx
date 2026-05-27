import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Login.css';

/**
 * OAuthCallback
 *
 * Landing page for /oauth/callback — the backend redirects here after a
 * successful OAuth flow with `?token=<AT>&refresh=<RT>` in the URL.
 *
 * This page:
 *   1. Reads tokens from search params
 *   2. Persists them to localStorage (same pattern as email/password login)
 *   3. Redirects to the dashboard
 *   4. On any error, redirects to /login?error=oauth_failed
 */
export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing authentication…');

  useEffect(() => {
    const token   = searchParams.get('token');
    const refresh = searchParams.get('refresh');

    if (!token || !refresh) {
      // Missing tokens — treat as failure
      setStatus('Authentication failed. Redirecting…');
      const t = setTimeout(() => navigate('/login?error=oauth_failed', { replace: true }), 1500);
      return () => clearTimeout(t);
    }

    try {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refresh);
      setStatus('Authenticated! Redirecting to dashboard…');
      navigate('/dashboard', { replace: true });
    } catch {
      // Storage might be blocked (private browsing, etc.)
      setStatus('Unable to save session. Redirecting…');
      const t = setTimeout(() => navigate('/login?error=oauth_failed', { replace: true }), 1500);
      return () => clearTimeout(t);
    }
  }, [navigate, searchParams]);

  return (
    <main className="login-page" role="main" aria-label="OAuth authentication callback">
      <div className="oauth-callback-card">
        {/* Animated logo */}
        <div className="oauth-spinner-wrapper" aria-hidden="true">
          <span className="oauth-ring" />
        </div>
        <h1 className="oauth-callback-title">Completing Sign In</h1>
        <p className="oauth-callback-status" aria-live="polite">{status}</p>
      </div>
    </main>
  );
}
