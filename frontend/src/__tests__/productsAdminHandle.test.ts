import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../api/http', () => {
  const apiFetch = vi.fn();
  return { apiFetch };
});

// Import after setting up the mock
import { createProduct, updateProduct, deleteProduct } from '../api/products';

describe('products admin handle', () => {
  beforeEach(async () => {
    const http = await import('../api/http');
    (http.apiFetch as any).mockReset();
  });

  it('returns product on success for create', async () => {
    const product = { id: '1', name: 'X', description: 'd', price: 1, imageUrl: 'u', stock: 1 };
    const http = await import('../api/http');
    (http.apiFetch as any).mockResolvedValueOnce(
      new Response(JSON.stringify(product), { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
    const res = await createProduct({ name: 'X', description: 'd', price: 1, imageUrl: 'u', stock: 1 });
    expect(res).toEqual(product);
  });

  it('returns void on delete 204', async () => {
    const http = await import('../api/http');
    (http.apiFetch as any).mockResolvedValueOnce(new Response(null, { status: 204 }));
    const res = await deleteProduct('1');
    expect(res).toBeUndefined();
  });

  it('maps token_expired to friendly message', async () => {
    const http = await import('../api/http');
    (http.apiFetch as any).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'token_expired', message: 'expired' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    await expect(updateProduct('1', { name: 'Z' })).rejects.toThrow('Session expired – please log in again');
  });

  it('maps admin_auth_required to friendly message', async () => {
    const http = await import('../api/http');
    (http.apiFetch as any).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'admin_auth_required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    await expect(createProduct({ name: 'X', description: 'd', price: 1, imageUrl: 'u', stock: 1 })).rejects.toThrow(
      'Admin authentication required'
    );
  });

  it('maps forbidden_admin_role to friendly message', async () => {
    const http = await import('../api/http');
    (http.apiFetch as any).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'forbidden_admin_role' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    await expect(updateProduct('1', { name: 'Y' })).rejects.toThrow('Access denied – admin role required');
  });
});
