import * as React from 'react';
import type { Product } from '../types/product';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import { fetchProducts } from '../api/products';

const ProductList = () => {
  const [products, setProducts] = React.useState([] as Product[]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null as string | null);

  React.useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProducts({ signal: controller.signal });
        setProducts(data);
      } catch (e: unknown) {
        if (!(e instanceof DOMException && e.name === 'AbortError')) {
          const message = e instanceof Error ? e.message : 'Failed to load products';
          setError(message);
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
