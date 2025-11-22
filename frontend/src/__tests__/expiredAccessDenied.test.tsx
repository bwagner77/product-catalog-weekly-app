import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, beforeEach, expect } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import PrivateRoute from '../components/PrivateRoute';
import App from '../App';

// T185: Expired token admin page access UX test (SC-034)
// Ensures expired token produces stable AccessDenied experience with no privileged control flicker.

function makeExpiredAdminToken(): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ role: 'admin', exp: Math.floor(Date.now() / 1000) - 60 })); // already expired
  return `${header}.${payload}.signature`;
}

describe('Expired admin token access UX', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('shoply_admin_token', makeExpiredAdminToken());
  });

  it('renders AccessDenied and hides protected content with expired token (direct PrivateRoute)', () => {
    render(
      <AuthProvider>
        <PrivateRoute>
          <div data-testid="protected-admin-content">SECRET ADMIN</div>
        </PrivateRoute>
      </AuthProvider>
    );
    expect(screen.getByTestId('access-denied')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-admin-content')).toBeNull();
  });

  it('does not show admin navigation links in full App with expired token', async () => {
    render(<App />);
    // Products nav should be present
    expect(screen.getByTestId('nav-products')).toBeInTheDocument();
    // Login nav should be present (unauthenticated state)
    expect(screen.getByTestId('nav-login')).toBeInTheDocument();
    // Categories nav must be absent (no flicker of privileged control)
    expect(screen.queryByTestId('nav-categories')).toBeNull();
  });
});
