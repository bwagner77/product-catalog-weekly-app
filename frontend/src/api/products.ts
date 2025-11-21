import type { Product } from '../types/product';

type FetchOptions = {
  signal?: AbortSignal;
  baseUrl?: string;
  search?: string;
  categoryId?: string;
};

function buildApiUrl(baseUrl?: string, search?: string, categoryId?: string): string {
  const envBase = (import.meta.env.VITE_API_BASE_URL as string) || '';
  const base = (baseUrl ?? envBase).replace(/\/$/, '');
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
