import React from 'react';
import { describe, it, beforeEach, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Far-future admin token
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJleHAiOjQxMDI0NDQ4MDB9.signature';

describe('Auth persistence across reload', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows admin links on initial load when token present', () => {
    localStorage.setItem('shoply_admin_token', token);
    render(<App />);
    expect(screen.getByTestId('nav-categories')).toBeInTheDocument();
    expect(screen.getByTestId('nav-product-mgmt')).toBeInTheDocument();
  });
});
