import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import ProductList from '../pages/ProductList';

const flush = () => new Promise((r) => setTimeout(r, 0));

describe('[US2] ProductList states', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // default env base
    (import.meta as any).env = (import.meta as any).env || {};
    (import.meta as any).env.VITE_API_BASE_URL = '';
  });

  it('shows loading while fetching', async () => {
    const resolveLater: { resolve?: (v: any) => void } = {};
    const pending = new Promise((resolve) => { resolveLater.resolve = resolve; });
    vi.spyOn(global, 'fetch' as any).mockImplementation(() => pending as any);

    render(<ProductList />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // resolve with empty list
    resolveLater.resolve?.({ ok: true, json: async () => [] });
    await flush();
    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());
  });

  it('shows empty state when no products', async () => {
    vi.spyOn(global, 'fetch' as any).mockResolvedValue({ ok: true, json: async () => [] });

    render(<ProductList />);

    expect(await screen.findByText(/no products/i)).toBeInTheDocument();
  });

  it('shows error state when request fails', async () => {
    vi.spyOn(global, 'fetch' as any).mockResolvedValue({ ok: false, status: 500 });

    render(<ProductList />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});
