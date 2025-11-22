import { describe, it, expect, vi, beforeEach } from 'vitest';

// Capture calls to apiFetch
const calls: Array<[string, RequestInit | undefined]> = [];

vi.mock('../api/http', () => {
  return {
    apiFetch: vi.fn(async (url: string, init?: RequestInit) => {
      calls.push([url, init]);
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }),
  };
});

// Import after mocking
import { fetchProducts } from '../api/products';

describe('products api url builder', () => {
  beforeEach(() => {
    calls.length = 0;
  });

  it('uses relative /api/products with no options when baseUrl empty', async () => {
    await fetchProducts({ baseUrl: '' });
    expect(calls[0][0]).toBe('/api/products');
  });

  it('adds search query param when provided', async () => {
    await fetchProducts({ search: 'milk' });
    const url = calls[0][0];
    expect(url).toContain('/api/products?');
    expect(url).toContain('search=milk');
  });

  it('adds both search and categoryId params', async () => {
    await fetchProducts({ baseUrl: '', search: 'bread', categoryId: 'abc123' });
    const url = calls[0][0];
    expect(url.startsWith('/api/products?')).toBe(true);
    expect(url).toContain('search=bread');
    expect(url).toContain('categoryId=abc123');
  });

  it('builds absolute url when baseUrl provided and trims trailing slash', async () => {
    await fetchProducts({ baseUrl: 'http://example.com/', search: 'eggs' });
    const url = calls[0][0];
    expect(url).toBe('http://example.com/api/products?search=eggs');
  });
});
