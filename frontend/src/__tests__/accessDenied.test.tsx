import React from 'react';
import { render, screen } from '@testing-library/react';
import PrivateRoute from '../components/PrivateRoute';
import { AuthProvider } from '../context/AuthContext';

// T168: AccessDenied render test ensures component appears and protected content not rendered when unauthenticated.

describe('AccessDenied Component via PrivateRoute', () => {
  test('renders AccessDenied and hides protected children when unauthenticated', () => {
    render(
      <AuthProvider>
        <PrivateRoute>
          <div data-testid="protected-content">SECRET</div>
        </PrivateRoute>
      </AuthProvider>
    );
    expect(screen.getByTestId('access-denied')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).toBeNull();
    expect(screen.getByRole('alert')).toHaveTextContent(/Admin access required/i);
  });
});
