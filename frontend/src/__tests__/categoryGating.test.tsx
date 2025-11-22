import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import CategoryManagement from '../pages/CategoryManagement';

describe('CategoryManagement gating (frontend)', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('shows permission message and does not add category when backend returns 403', async () => {
    let calls: any[] = [];
    global.fetch = vi.fn(async (input: RequestInfo, init?: RequestInit) => {
      calls.push({ input, init });
      if (typeof input === 'string' && input.endsWith('/api/categories') && init?.method === 'POST') {
        return new Response(JSON.stringify({ error: 'Category administration disabled' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
      }
      // list categories initial load
      if (typeof input === 'string' && input.endsWith('/api/categories') && (!init || init.method === 'GET')) {
        return new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response('Not Found', { status: 404 });
    }) as any;

    render(<CategoryManagement />);
    const input = await screen.findByLabelText(/name/i);
    fireEvent.change(input, { target: { value: 'BlockedCat' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Category administration disabled/i);
    });

    // Ensure category not added to table
    expect(screen.queryByText('BlockedCat')).toBeNull();
    // Ensure POST was attempted once
    const postCalls = calls.filter(c => c.init?.method === 'POST');
    expect(postCalls.length).toBe(1);
  });
});
