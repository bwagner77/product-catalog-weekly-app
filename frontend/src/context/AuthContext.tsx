import React, { useContext, useEffect, useState, useCallback } from 'react';

interface AuthState {
  token: string | null;
  role: string | null;
  exp: number | null;
  authenticated: boolean;
  login(username: string, password: string): Promise<boolean>;
  logout(): void;
  refreshFromStorage(): void;
}

const AuthContext = React.createContext<AuthState | undefined>(undefined);

function decodePayload(token: string): { role?: string; exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const STORAGE_KEY = 'shoply_admin_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [exp, setExp] = useState<number | null>(null);

  const refreshFromStorage = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setToken(null); setRole(null); setExp(null); return;
    }
    const payload = decodePayload(stored);
    setToken(stored);
    setRole(payload?.role || null);
    setExp(payload?.exp || null);
  }, []);

  useEffect(() => { refreshFromStorage(); }, [refreshFromStorage]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const base = (import.meta.env.VITE_API_BASE_URL as string) || '';
      const res = await fetch(`${base.replace(/\/$/, '')}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data?.token) {
        localStorage.setItem(STORAGE_KEY, data.token);
        refreshFromStorage();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null); setRole(null); setExp(null);
  };

  const isExpired = exp != null && Date.now() / 1000 > exp;

  return (
    <AuthContext.Provider value={{ token, role, exp, authenticated: !!token && !isExpired, login, logout, refreshFromStorage }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getAuthToken(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}
