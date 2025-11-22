import React from 'react';
import { describe, it, beforeEach, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Expired admin token
function makeExpiredAdminToken(): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ role: 'admin', exp: Math.floor(Date.now() / 1000) - 10 }));
  return `${header}.${payload}.signature`;
}

describe('Nav admin link expiry behavior', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('removes admin links when token is expired on load', () => {
    localStorage.setItem('shoply_admin_token', makeExpiredAdminToken());
    render(<App />);
    // Admin links absent
    expect(screen.queryByTestId('nav-categories')).toBeNull();
    expect(screen.queryByTestId('nav-product-mgmt')).toBeNull();
    // Login is visible
    expect(screen.getByTestId('nav-login')).toBeInTheDocument();
  });
});
