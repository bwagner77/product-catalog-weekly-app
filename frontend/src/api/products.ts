import type { Product } from '../types/product';
import { apiFetch } from './http';

type FetchOptions = {
  signal?: AbortSignal;
  baseUrl?: string;
  search?: string;
  categoryId?: string;
};

function buildApiUrl(baseUrl?: string, search?: string, categoryId?: string): string {
  const envBase = (import.meta.env.VITE_API_BASE_URL as string) || '';
  const rawBase = (baseUrl ?? envBase).trim();
  const base = rawBase.replace(/\/$/, '');
  // If no base provided, fall back to relative path (supports dev proxy / same-origin)
  if (!base) {
    const params: string[] = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (categoryId) params.push(`categoryId=${encodeURIComponent(categoryId)}`);
    return params.length ? `/api/products?${params.join('&')}` : '/api/products';
  }
  const url = new URL(`${base}/api/products`);
  if (search) url.searchParams.set('search', search);
  if (categoryId) url.searchParams.set('categoryId', categoryId);
  return url.toString();
}

export async function fetchProducts(options: FetchOptions = {}): Promise<Product[]> {
  const { signal, baseUrl, search, categoryId } = options;
  const url = buildApiUrl(baseUrl, search, categoryId);
  const res = await apiFetch(url, { signal } as RequestInit);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  const data: unknown = await res.json();
  return Array.isArray(data) ? (data as Product[]) : [];
}

export default fetchProducts;

// Admin operations

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  categoryId?: string;
}

async function handle<T>(res: Response): Promise<T> {
  if (res.ok) {
    // DELETE returns 204 with no body
    // @ts-expect-error allow void return
    return (res.status === 204 ? undefined : await res.json()) as T;
  }
  let raw: string | undefined;
  let parsed: any = null;
  try {
    raw = await res.text();
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    // ignore JSON parse error
  }
  const code = parsed?.error;
  const message = parsed?.message || parsed?.error || raw || `Request failed with ${res.status}`;
  let display = message;
  if (code === 'token_expired') display = 'Session expired – please log in again';
  else if (code === 'admin_auth_required') display = 'Admin authentication required';
  else if (code === 'forbidden_admin_role') display = 'Access denied – admin role required';
  throw new Error(display);
}

const baseEnv = (import.meta.env.VITE_API_BASE_URL as string) || '';
const productsRoot = `${baseEnv.replace(/\/$/, '')}/api/products`;

export async function createProduct(input: ProductInput): Promise<Product> {
  const res = await apiFetch(productsRoot, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handle<Product>(res);
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  const res = await apiFetch(`${productsRoot}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handle<Product>(res);
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await apiFetch(`${productsRoot}/${id}`, { method: 'DELETE' });
  return handle<void>(res);
}
