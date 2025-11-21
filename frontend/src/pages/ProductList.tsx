import * as React from 'react';
import type { Product } from '../types/product';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import { fetchProducts } from '../api/products';
import { listCategories } from '../api/categories';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import type { Category } from '../types/category';

const ProductList = () => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [categoryId, setCategoryId] = React.useState<string | undefined>(undefined);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [initialFetchDone, setInitialFetchDone] = React.useState(false);

  React.useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProducts({ signal: controller.signal, search: search.trim() || undefined, categoryId });
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
        setInitialFetchDone(true);
      }
    }

    load();
    return () => controller.abort();
  }, [search, categoryId]);

  // Load categories once
  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await listCategories();
        if (active) setCategories(data);
      } catch (e) {
        // Swallow category errors for now (non-critical)
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section aria-labelledby="product-list-heading">
      <h2 id="product-list-heading" className="sr-only">
        Products
      </h2>
      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Search and filter controls">
        <div className="sm:col-span-1 lg:col-span-1">
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <div className="sm:col-span-1 lg:col-span-1">
          <CategoryFilter categories={categories} value={categoryId} onChange={setCategoryId} />
        </div>
      </div>
      {loading && <Loading message="Loading…" />}
      {!loading && error && <ErrorMessage message={error} />}
      {!loading && !error && products.length === 0 && initialFetchDone && (
        <EmptyState message={search || categoryId ? 'No matching products found.' : 'No products available.'} />
      )}
      {!loading && !error && products.length > 0 && (
        <ul
          role="list"
          aria-label="Product list"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {products.map((p: Product) => (
            <li key={p.id} role="listitem" tabIndex={0} aria-label={`Product: ${p.name}`}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ProductList;
