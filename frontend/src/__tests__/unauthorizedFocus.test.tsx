import React from 'react';
import { describe, it, beforeEach, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

// T202: Unauthorized (non-admin token) → API returns 403 forbidden_admin_role.
// The client clears token and exposes login; when navigating to Login, focus lands on heading.

function makeToken(role: string, expOffsetSec: number) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ role, exp: Math.floor(Date.now() / 1000) + expOffsetSec }));
  return `${header}.${payload}.signature`;
}

describe('Unauthorized redirect focus (non-admin token)', () => {
  beforeEach(() => {
    localStorage.clear();
    // Seed with non-admin token (valid, not expired)
    localStorage.setItem('shoply_admin_token', makeToken('user', 3600));

    // Mock fetch behavior: products/categories succeed; admin writes return forbidden_admin_role
    (global.fetch as any) = (input: RequestInfo, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/api/products') && init?.method === 'POST') {
        return Promise.resolve(new Response(JSON.stringify({ error: 'forbidden_admin_role', message: 'Admin role required' }), { status: 403, headers: { 'Content-Type': 'application/json' } }));
      }
      if (url.includes('/api/products')) {
        return Promise.resolve(new Response(JSON.stringify([
          { id: 'p1', name: 'P1', description: 'D1', price: 1, stock: 1, imageUrl: 'images/product1.jpg' }
        ]), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
      if (url.includes('/api/categories')) {
        return Promise.resolve(new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
      return Promise.resolve(new Response(null, { status: 200 }));
    };
  });

  it('clears token on 403 and focuses login heading after navigating to Login', async () => {
    render(<App />);
    // Navigate to Product Management (admin-only link visible due to authenticated=true with non-admin role)
    const pm = await screen.findByTestId('nav-product-mgmt');
    fireEvent.click(pm);

    // Fill minimal valid fields and submit to trigger 403
    const nameInput = await screen.findByLabelText(/name/i);
    const descInput = await screen.findByLabelText(/description/i);
    const imgInput = await screen.findByLabelText(/image url/i);
    fireEvent.change(nameInput, { target: { value: 'Test Product' } });
    fireEvent.change(descInput, { target: { value: 'Desc' } });
    fireEvent.change(imgInput, { target: { value: 'http://example.com/img.jpg' } });
    const createBtn = await screen.findByRole('button', { name: /create/i });
    fireEvent.click(createBtn);

    // After 403, token cleared by api/http; login nav should appear
    await waitFor(() => expect(screen.getByTestId('nav-login')).toBeInTheDocument());

    // Go to Login and assert focus lands on login heading (Login has focusOnMount prop in App)
    fireEvent.click(screen.getByTestId('nav-login'));
    const heading = await screen.findByRole('heading', { name: /admin login/i });
    expect(document.activeElement).toBe(heading);
  });
});
