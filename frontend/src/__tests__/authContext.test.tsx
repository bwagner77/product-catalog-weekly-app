import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Helper to wrap provider for hooks
function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

// Pre-built far-future admin token (payload role=admin, exp far future)
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJleHAiOjQxMDI0NDQ4MDB9.signature';

describe('AuthContext basics', () => {
  it('parses role & exp from stored token', () => {
    localStorage.setItem('shoply_admin_token', token);
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.role).toBe('admin');
    expect(result.current.exp).toBeGreaterThan(Date.now() / 1000);
    expect(result.current.authenticated).toBe(true);
  });

  it('logout clears token and authenticated state', () => {
    localStorage.setItem('shoply_admin_token', token);
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.logout());
    expect(result.current.token).toBeNull();
    expect(result.current.authenticated).toBe(false);
  });
});
