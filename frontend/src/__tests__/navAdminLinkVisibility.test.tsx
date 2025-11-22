import React from 'react';
import { describe, it, beforeEach, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJleHAiOjQxMDI0NDQ4MDB9.signature';

describe('Nav admin link visibility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('hides admin links when unauthenticated', () => {
    render(<App />);
    expect(screen.queryByTestId('nav-categories')).toBeNull();
    expect(screen.queryByTestId('nav-product-mgmt')).toBeNull();
  });

  it('shows admin links when authenticated', () => {
    localStorage.setItem('shoply_admin_token', adminToken);
    render(<App />);
    expect(screen.getByTestId('nav-categories')).toBeInTheDocument();
    expect(screen.getByTestId('nav-product-mgmt')).toBeInTheDocument();
  });

  it('hides admin links after logout', async () => {
    localStorage.setItem('shoply_admin_token', adminToken);
    render(<App />);
    // logout button should be present
    const logout = screen.getByTestId('nav-logout');
    logout.click();
    // login link returns
    expect(await screen.findByTestId('nav-login')).toBeInTheDocument();
    // admin links gone
    expect(screen.queryByTestId('nav-categories')).toBeNull();
    expect(screen.queryByTestId('nav-product-mgmt')).toBeNull();
  });
});
