import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

/**
 * ProtectedRoute
 *
 * Guards all post-auth routes:
 *  1. No token or no user -> redirect to /login
 *  2. isProfileComplete === false -> redirect to /complete-profile
 *  3. All good -> render children
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <main style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--color-bg)',
        flexDirection: 'column', gap: '16px',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-accent)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family)' }}>
          Verifying session…
        </p>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </main>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!user.isProfileComplete) return <Navigate to="/complete-profile" replace />;

  return children;
}
