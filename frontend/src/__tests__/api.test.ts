import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchProducts } from '../api/products';

describe('API utils: fetchProducts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    (import.meta as any).env = (import.meta as any).env || {};
  });

  it('fetches from /api/products when no base URL set', async () => {
    (import.meta as any).env.VITE_API_BASE_URL = '';
    const mock = vi
      .spyOn(global, 'fetch' as any)
      .mockResolvedValue({ ok: true, json: async () => [] });

    const result = await fetchProducts({ baseUrl: '' });
    expect(Array.isArray(result)).toBe(true);
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock.mock.calls[0][0]).toBe('/api/products');
  });

  it('uses VITE_API_BASE_URL when provided and trims trailing slash', async () => {
    (import.meta as any).env.VITE_API_BASE_URL = 'http://localhost:3000/';
    const mock = vi
      .spyOn(global, 'fetch' as any)
      .mockResolvedValue({ ok: true, json: async () => [] });

    await fetchProducts();
    expect(mock).toHaveBeenCalledWith('http://localhost:3000/api/products', expect.anything());
  });

  it('passes AbortSignal when provided', async () => {
    (import.meta as any).env.VITE_API_BASE_URL = '';
    const controller = new AbortController();
    const mock = vi
      .spyOn(global, 'fetch' as any)
      .mockResolvedValue({ ok: true, json: async () => [] });

    await fetchProducts({ signal: controller.signal });
    expect(mock).toHaveBeenCalledTimes(1);
  const callInit = mock.mock.calls[0][1] as any;
  expect(callInit.signal).toBe(controller.signal);
  });

  it('throws on non-ok response', async () => {
    (import.meta as any).env.VITE_API_BASE_URL = '';
    vi.spyOn(global, 'fetch' as any).mockResolvedValue({ ok: false, status: 500 });
    await expect(fetchProducts()).rejects.toThrow(/500/);
  });
});
