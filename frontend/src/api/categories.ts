import type { Category, CategoryInput } from '../types/category';

const base = (import.meta.env.VITE_API_BASE_URL as string) || '';
const root = `${base.replace(/\/$/, '')}/api/categories`;

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function listCategories(): Promise<Category[]> {
  const res = await fetch(root, { method: 'GET' });
  return handle<Category[]>(res);
}

export async function getCategory(id: string): Promise<Category> {
  const res = await fetch(`${root}/${id}`, { method: 'GET' });
  return handle<Category>(res);
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const res = await fetch(root, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handle<Category>(res);
}

export async function updateCategory(id: string, input: CategoryInput): Promise<Category> {
  const res = await fetch(`${root}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handle<Category>(res);
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${root}/${id}`, { method: 'DELETE' });
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