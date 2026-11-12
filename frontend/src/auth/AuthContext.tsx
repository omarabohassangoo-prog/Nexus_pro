import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth.api';
import { setAccessToken, clearAccessToken, getAccessToken } from '../api/client';
import type { SafeUser } from '../types/models.types';

interface AuthState {
  user: SafeUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ redirectTo: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  hasPermission: (key: string) => boolean;
}

export const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
      setPermissions([]);
    } catch {
      setUser(null);
      setPermissions([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (getAccessToken()) await loadUser();
      setLoading(false);
    })();
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    setAccessToken(res.accessToken);
    setUser(res.user);
    await loadUser();
    return { redirectTo: res.redirectTo };
  }, [loadUser]);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    clearAccessToken();
    setUser(null);
    setPermissions([]);
  }, []);

  const refresh = useCallback(async () => { await loadUser(); }, [loadUser]);
  const hasPermission = useCallback((key: string) => permissions.includes(key), [permissions]);

  const value = useMemo<AuthState>(() => ({ user, loading, login, logout, refresh, hasPermission }), [user, loading, login, logout, refresh, hasPermission]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
