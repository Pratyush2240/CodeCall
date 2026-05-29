import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../api/axios';

const UserContext = createContext(null);

/**
 * UserProvider
 *
 * Fetches the current user once on mount and shares it app-wide.
 * All components call `useUser()` instead of hitting /api/auth/me directly.
 *
 * Provides:
 *   user      - the user object (null while loading or unauthenticated)
 *   loading   - true while the first /me fetch is in-flight
 *   error     - fetch error message if any
 *   refetch   - call after mutations (profile update) to refresh user data
 */
export function UserProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await API.get('/auth/me');
      setUser(res.data?.data ?? null);
    } catch {
      // Token invalid / expired — context stays null, ProtectedRoute handles redirect
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <UserContext.Provider value={{ user, loading, error, refetch: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * useUser — consume user context in any component
 * @returns {{ user, loading, error, refetch }}
 */
export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside <UserProvider>');
  return ctx;
}

/**
 * Derives avatar initials and a stable background color from a user object.
 * Used by Navbar avatar and Sidebar collaborator bubbles.
 *
 * @param {string} name   - fullName or username
 * @param {string} [id]   - optional userId for color stability
 */
export function getAvatarMeta(name = '', id = '') {
  // Initials: up to 2 chars from first/last word of name
  const parts = name.trim().split(/\s+/);
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : (name.slice(0, 2)).toUpperCase() || '?';

  // Deterministic color from id or name
  const seed = (id + name).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const COLORS = [
    { bg: '#EFF6FF', text: '#2563EB' }, // blue
    { bg: '#F0FDF4', text: '#16A34A' }, // green
    { bg: '#FFF7ED', text: '#EA580C' }, // orange
    { bg: '#FDF4FF', text: '#9333EA' }, // purple
    { bg: '#FFF1F2', text: '#E11D48' }, // rose
    { bg: '#F0FDFA', text: '#0D9488' }, // teal
  ];
  const color = COLORS[seed % COLORS.length];

  return { initials, ...color };
}
