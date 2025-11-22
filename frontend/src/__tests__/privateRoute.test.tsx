import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import PrivateRoute from '../components/PrivateRoute';

// Helper to mount with optional token priming
function renderWithAuth(child: React.ReactNode, token?: string) {
  if (token) localStorage.setItem('shoply_admin_token', token); else localStorage.removeItem('shoply_admin_token');
  return render(<AuthProvider>{child}</AuthProvider>);
}

const futureToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJleHAiOjQxMDI0NDQ4MDB9.sig';

describe('PrivateRoute', () => {
  it('renders children when authenticated', () => {
    renderWithAuth(<PrivateRoute><p>Secret</p></PrivateRoute>, futureToken);
    expect(screen.getByText('Secret')).toBeInTheDocument();
  });
  it('shows access denied when unauthenticated', () => {
    renderWithAuth(<PrivateRoute><p>Secret</p></PrivateRoute>);
    expect(screen.getByRole('alert')).toHaveTextContent(/access denied/i);
  });
});
