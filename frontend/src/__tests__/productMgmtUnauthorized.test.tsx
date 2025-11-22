import React from 'react';
import { describe, it, beforeEach, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductManagement from '../pages/ProductManagement';
import { AuthProvider } from '../context/AuthContext';

function wrapper(children: React.ReactNode) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('ProductManagement unauthorized access UX', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows AccessDenied and no admin form when anonymous', () => {
    render(wrapper(<ProductManagement />));
    expect(screen.getByTestId('access-denied')).toBeInTheDocument();
    // Create button or table should not be present
    expect(screen.queryByRole('button', { name: 'Create' })).toBeNull();
    expect(screen.queryByRole('table', { name: 'Product list' })).toBeNull();
  });
});
