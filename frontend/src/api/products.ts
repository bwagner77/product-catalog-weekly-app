import type { Product } from '../types/product';

type FetchOptions = {
  signal?: AbortSignal;
  baseUrl?: string;
};

function buildApiUrl(baseUrl?: string): string {
  const envBase = (import.meta as ImportMeta)?.env?.VITE_API_BASE_URL as string | undefined;
  const base = (baseUrl ?? envBase ?? '').replace(/\/$/, '');
  return `${base}/api/products`;
}

export async function fetchProducts(options: FetchOptions = {}): Promise<Product[]> {
  const { signal, baseUrl } = options;
  const url = buildApiUrl(baseUrl);
  const res = await fetch(url, { signal } as RequestInit);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  const data: unknown = await res.json();
  return Array.isArray(data) ? (data as Product[]) : [];
}

export default fetchProducts;
