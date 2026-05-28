import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import API from '../api/axios';

/**
 * ProtectedRoute
 *
 * Guards all post-auth routes. Performs three checks:
 *  1. No token in localStorage → redirect to /login
 *  2. GET /api/auth/me fails (expired / revoked) → redirect to /login
 *  3. isProfileComplete === false → redirect to /complete-profile
 *
 * While the /me check is in-flight, renders a full-page loading state
 * so there's no flash of the protected content or premature redirect.
 */
export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'ok' | 'unauthenticated' | 'incomplete'

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setStatus('unauthenticated');
      return;
    }

    API.get('/auth/me')
      .then(res => {
        const user = res.data?.data;
        if (!user?.isProfileComplete) {
          setStatus('incomplete');
        } else {
          setStatus('ok');
        }
      })
      .catch(() => {
        // Token invalid / expired
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setStatus('unauthenticated');
      });
  }, []);

  if (status === 'loading') {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg)',
          flexDirection: 'column',
          gap: '16px',
        }}
        aria-label="Verifying authentication"
      >
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-accent)',
          animation: 'spin 0.8s linear infinite',
        }} aria-hidden="true" />
        <p style={{
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-family)',
        }}>
          Verifying session…
        </p>
      </main>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  if (status === 'incomplete') {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
}
