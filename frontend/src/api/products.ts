import type { Product } from '../types/product';

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
  const res = await fetch(url, { signal } as RequestInit);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  const data: unknown = await res.json();
  return Array.isArray(data) ? (data as Product[]) : [];
}

export default fetchProducts;
