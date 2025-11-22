import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, beforeEach, expect } from 'vitest';
import App from '../App';

// T186: Logout focus a11y test
// After logout, focus should land on login heading and admin links disappear.

beforeEach(() => {
  localStorage.clear();
  // Mock fetch for login endpoint and required products/categories
  (global.fetch as any) = (input: RequestInfo) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('/api/auth/login')) {
      // Return a dummy token (non-expired) with admin role
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 }));
      return Promise.resolve({ ok: true, json: async () => ({ token: `${header}.${payload}.signature` }) });
    }
    if (url.includes('/api/products')) {
      return Promise.resolve({ ok: true, json: async () => [
        { id: 'p-1', name: 'Prod', description: 'D', price: 5, stock: 5, imageUrl: 'images/product1.jpg', categoryId: 'c-1' }
      ] });
    }
    if (url.includes('/api/categories')) {
      return Promise.resolve({ ok: true, json: async () => [] });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  };
});

describe('Logout focus accessibility', () => {
  it('focus moves to login heading and admin links hidden after logout', async () => {
    render(<App />);
    // Navigate to login
    fireEvent.click(screen.getByTestId('nav-login'));
    // Perform login
    const submitBtn = await screen.findByRole('button', { name: /sign in/i });
    fireEvent.click(submitBtn);
    // Categories nav should now appear
    expect(await screen.findByTestId('nav-categories')).toBeInTheDocument();
    const logoutBtn = screen.getByTestId('nav-logout');
    fireEvent.click(logoutBtn);
    // Categories nav gone, login nav present
    expect(screen.queryByTestId('nav-categories')).toBeNull();
    expect(screen.getByTestId('nav-login')).toBeInTheDocument();
    // Focus should be on login heading
    const heading = screen.getByRole('heading', { name: /admin login/i });
    expect(document.activeElement).toBe(heading);
  });
});
