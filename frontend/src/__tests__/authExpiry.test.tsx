import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, beforeEach, expect } from 'vitest';
import App from '../App';

// T167: Token expiry simulation test
// Past-exp token should be cleared and user redirected to login view (unauthenticated state).

function makeExpiredToken(): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ role: 'admin', exp: Math.floor(Date.now() / 1000) - 300 }));
  return `${header}.${payload}.sig`; // signature ignored for local parsing
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('shoply_admin_token', makeExpiredToken());
  // Minimal fetch mocks to satisfy product/category requests
  (global.fetch as any) = (input: RequestInfo) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('/api/products')) {
      return Promise.resolve({ ok: true, json: async () => [] });
    }
    if (url.includes('/api/categories')) {
      return Promise.resolve({ ok: true, json: async () => [] });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  };
});

describe('Auth expiry handling', () => {
  it('clears expired token and shows login navigation + login heading', async () => {
    render(<App />);
    // Token should be cleared by AuthProvider effect
    expect(localStorage.getItem('shoply_admin_token')).toBeNull();
    // Login nav present, categories nav absent
    expect(screen.getByTestId('nav-login')).toBeInTheDocument();
    expect(screen.queryByTestId('nav-categories')).toBeNull();
    // Switch to login view (if not already active)
    screen.getByTestId('nav-login').click();
    const heading = await screen.findByRole('heading', { name: /admin login/i });
    expect(heading).toBeInTheDocument();
  });
});
