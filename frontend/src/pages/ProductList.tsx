import * as React from 'react';
import type { Product } from '../types/product';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

const ProductList = () => {
  const [products, setProducts] = React.useState([] as Product[]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null as string | null);

  React.useEffect(() => {
    const controller = new AbortController();
    const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || '';
    const base = apiBase.replace(/\/$/, '');
    const url = `${base}/api/products`;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = (await res.json()) as Product[];
        setProducts(data);
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          setError(e?.message || 'Failed to load products');
          // eslint-disable-next-line no-console
          console.error('[ProductList] load error', e);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  return (
    <section aria-labelledby="product-list-heading">
      <h2 id="product-list-heading" className="sr-only">
        Products
      </h2>
      {loading && <Loading message="Loading…" />}
      {!loading && error && <ErrorMessage message={error} />}
      {!loading && !error && products.length === 0 && (
        <EmptyState message="No products found." />
      )}
      {!loading && !error && products.length > 0 && (
        <ul
          role="list"
          aria-label="Product list"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {products.map((p: Product) => (
            <li key={p.id} role="listitem">
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ProductList;
