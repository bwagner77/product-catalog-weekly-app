import { describe, it, expect } from 'vitest';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../api/categories';

// Helper to mock fetch responses
function mockFetch(status: number, body: any) {
  global.fetch = async () => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }) as any;
}

describe('categories API auth error mapping', () => {
  it('maps token_expired to session expired message', async () => {
    mockFetch(401, { error: 'token_expired', message: 'Token expired' });
    await expect(createCategory({ name: 'X' })).rejects.toThrow(/Session expired/i);
  });

  it('maps admin_auth_required to branded message', async () => {
    mockFetch(401, { error: 'admin_auth_required', message: 'Admin authentication required' });
    await expect(updateCategory('c1', { name: 'Y' })).rejects.toThrow(/Admin authentication required/i);
  });

  it('maps forbidden_admin_role to access denied message', async () => {
    mockFetch(403, { error: 'forbidden_admin_role', message: 'Admin role required' });
    await expect(deleteCategory('c1')).rejects.toThrow(/Access denied/i);
  });

  it('falls back gracefully on non-JSON error', async () => {
    global.fetch = async () => new Response('Plain failure', { status: 500 }) as any;
    await expect(listCategories()).rejects.toThrow(/Plain failure|500/);
  });
});