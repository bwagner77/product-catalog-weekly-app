import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import Login from '../pages/Login';

// Mock fetch for login
(global as any).fetch = vi.fn();

describe('Login page', () => {
  it('stores token and calls onSuccess on valid credentials', async () => {
    (fetch as any).mockResolvedValueOnce(new Response(JSON.stringify({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJleHAiOjQxMDI0NDQ4MDB9.sig' }), { status: 200 }));
    const handleSuccess = vi.fn();
    render(<AuthProvider><Login onSuccess={handleSuccess} /></AuthProvider>);
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(handleSuccess).toHaveBeenCalled());
    expect(localStorage.getItem('shoply_admin_token')).toBeTruthy();
  });

  it('shows error on invalid credentials', async () => {
    (fetch as any).mockResolvedValueOnce(new Response('{}', { status: 401 }));
    render(<AuthProvider><Login /></AuthProvider>);
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => screen.getByRole('alert'));
    expect(screen.getByRole('alert').textContent).toMatch(/invalid credentials/i);
  });
});
