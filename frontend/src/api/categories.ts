import type { Category, CategoryInput } from '../types/category';
import { apiFetch } from './http';

const base = (import.meta.env.VITE_API_BASE_URL as string) || '';
const root = `${base.replace(/\/$/, '')}/api/categories`;

async function handle<T>(res: Response): Promise<T> {
  if (res.ok) {
    return res.json() as Promise<T>;
  }
  // Attempt JSON parsing for standardized error bodies
  let raw: string | undefined;
  let parsed: unknown = null;
  try {
    raw = await res.text();
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    // fallback to raw
  }
  const p = (parsed && typeof parsed === 'object') ? (parsed as { error?: string; message?: string }) : null;
  const code = p?.error;
  const message = p?.message || p?.error || raw || `Request failed with ${res.status}`;
  // Map known auth error codes to branded UX messages
  let display = message;
  if (code === 'token_expired') {
    display = 'Session expired – please log in again';
  } else if (code === 'admin_auth_required') {
    display = 'Admin authentication required';
  } else if (code === 'forbidden_admin_role') {
    display = 'Access denied – admin role required';
  }
  throw new Error(display);
}

export async function listCategories(): Promise<Category[]> {
  const res = await apiFetch(root, { method: 'GET' });
  return handle<Category[]>(res);
}

export async function getCategory(id: string): Promise<Category> {
  const res = await apiFetch(`${root}/${id}`, { method: 'GET' });
  return handle<Category>(res);
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const res = await apiFetch(root, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handle<Category>(res);
}

export async function updateCategory(id: string, input: CategoryInput): Promise<Category> {
  const res = await apiFetch(`${root}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handle<Category>(res);
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await apiFetch(`${root}/${id}`, { method: 'DELETE' });
  if (res.status === 204) return;
  await handle(res); // will throw on non-2xx
}

export default {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};