import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => !!getToken());

  // Restore the session on page load
  useEffect(() => {
    if (!getToken()) return;
    api('/api/auth/me')
      .then((d) => setUser(d.user))
      .catch((err) => {
        if (err.status === 401) setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const startSession = useCallback(({ token, user: u }) => {
    setToken(token);
    setUser(u);
    return u;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'admin',
      login: async (email, password) => startSession(await api('/api/auth/login', { method: 'POST', body: { email, password } })),
      register: async (data) => startSession(await api('/api/auth/register', { method: 'POST', body: data })),
      startSession,
      logout() {
        setToken(null);
        setUser(null);
      },
      async refresh() {
        const d = await api('/api/auth/me');
        setUser(d.user);
        return d.user;
      },
      setUser,
    }),
    [user, loading, startSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
