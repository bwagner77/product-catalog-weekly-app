import * as React from 'react';
import type { Product } from '../types/product';
import type { Category } from '../types/category';
import { fetchProducts } from '../api/products';
import { createProduct, updateProduct, deleteProduct, ProductInput } from '../api/productsAdmin';
import { listCategories } from '../api/categories';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import AccessDenied from '../components/AccessDenied';

interface EditableProduct extends Product {
  _editing?: boolean;
  _pending?: boolean;
  _error?: string | null;
}

const emptyInput: ProductInput = {
  name: '',
  description: '',
  price: 0,
  imageUrl: '',
  stock: 0,
};

const ProductManagement: React.FC = () => {
  const { authenticated } = useAuth();
  const [products, setProducts] = React.useState<EditableProduct[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [createDraft, setCreateDraft] = React.useState<ProductInput>({ ...emptyInput });
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [drafts, setDrafts] = React.useState<Record<string, Partial<ProductInput>>>({});

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [prods, cats] = await Promise.all([fetchProducts(), listCategories()]);
      setProducts(prods.map(p => ({ ...p })));
      setCategories(cats);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load products';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { refresh(); }, []);

  function validateInput(input: Partial<ProductInput>): string | null {
    if (input.name !== undefined && !String(input.name).trim()) return 'Name required';
    if (input.description !== undefined && !String(input.description).trim()) return 'Description required';
    if (input.imageUrl !== undefined && !String(input.imageUrl).trim()) return 'Image URL required';
    if (input.price !== undefined && (typeof input.price !== 'number' || input.price < 0)) return 'Price must be non-negative';
    if (input.stock !== undefined && (typeof input.stock !== 'number' || input.stock < 0)) return 'Stock must be non-negative';
    return null;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const err = validateInput(createDraft);
    if (err) { setCreateError(err); return; }
    setBusy(true);
    setCreateError(null);
    try {
      const created = await createProduct({ ...createDraft, name: createDraft.name.trim(), description: createDraft.description.trim(), imageUrl: createDraft.imageUrl.trim() });
      setProducts(prev => [...prev, { ...created }]);
      setCreateDraft({ ...emptyInput });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Create failed';
      setCreateError(msg);
    } finally {
      setBusy(false);
    }
  }

  function startEdit(id: string) {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, _editing: true, _error: null } : p));
    const prod = products.find(p => p.id === id);
    if (prod) {
      setDrafts(d => ({ ...d, [id]: { name: prod.name, description: prod.description, price: prod.price, imageUrl: prod.imageUrl, stock: prod.stock, categoryId: prod.categoryId } }));
    }
  }

  function cancelEdit(id: string) {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, _editing: false, _error: null } : p));
    setDrafts(d => { const copy = { ...d }; delete copy[id]; return copy; });
  }

  async function saveEdit(id: string) {
    const draft = drafts[id] || {};
    const err = validateInput(draft);
    if (err) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, _error: err } : p));
      return;
    }
    setProducts(prev => prev.map(p => p.id === id ? { ...p, _pending: true, _error: null } : p));
    try {
      const updated = await updateProduct(id, draft);
      setProducts(prev => prev.map(p => p.id === id ? { ...updated } : p));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Update failed';
      setProducts(prev => prev.map(p => p.id === id ? { ...p, _error: msg } : p));
    } finally {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, _pending: false, _editing: false } : p));
      setDrafts(d => { const copy = { ...d }; delete copy[id]; return copy; });
    }
  }

  async function remove(id: string) {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, _pending: true, _error: null } : p));
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Delete failed';
      setProducts(prev => prev.map(p => p.id === id ? { ...p, _error: msg } : p));
    } finally {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, _pending: false } : p));
    }
  }

  if (!authenticated) {
    return <AccessDenied />;
  }

  return (
    <section aria-labelledby="product-mgmt-heading" className="space-y-6">
      <h2 id="product-mgmt-heading" className="text-lg font-semibold">Product Management</h2>

      <form onSubmit={handleCreate} aria-label="Create product" className="grid grid-cols-1 md:grid-cols-6 gap-3 items-start">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="new-product-name">Name</label>
          <input id="new-product-name" type="text" value={createDraft.name} onChange={e => setCreateDraft(d => ({ ...d, name: e.target.value }))} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" disabled={busy} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1" htmlFor="new-product-desc">Description</label>
          <input id="new-product-desc" type="text" value={createDraft.description} onChange={e => setCreateDraft(d => ({ ...d, description: e.target.value }))} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" disabled={busy} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="new-product-price">Price</label>
          <input id="new-product-price" type="number" min={0} step={0.01} value={createDraft.price} onChange={e => setCreateDraft(d => ({ ...d, price: Number(e.target.value) }))} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" disabled={busy} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="new-product-stock">Stock</label>
          <input id="new-product-stock" type="number" min={0} step={1} value={createDraft.stock} onChange={e => setCreateDraft(d => ({ ...d, stock: Number(e.target.value) }))} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" disabled={busy} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="new-product-category">Category</label>
          <select id="new-product-category" value={createDraft.categoryId || ''} onChange={e => setCreateDraft(d => ({ ...d, categoryId: e.target.value || undefined }))} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" disabled={busy}>
            <option value="">Unassigned</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="block text-sm font-medium mb-1" htmlFor="new-product-image">Image URL</label>
          <input id="new-product-image" type="text" value={createDraft.imageUrl} onChange={e => setCreateDraft(d => ({ ...d, imageUrl: e.target.value }))} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" disabled={busy} />
        </div>
        <div className="flex items-end">
          <button type="submit" disabled={busy} className="px-4 py-2 rounded bg-indigo-600 text-white text-sm disabled:opacity-50">Create</button>
        </div>
        {createError && <p role="alert" className="text-xs text-red-600 mt-1 md:col-span-6">{createError}</p>}
      </form>

      {loading && <Loading message="Loading products…" />}
      {!loading && error && <ErrorMessage message={error} />}
      {!loading && !error && products.length === 0 && <p>No products defined.</p>}
      {!loading && !error && products.length > 0 && (
        <table className="w-full text-sm" aria-label="Product list">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-2">Name</th>
              <th className="py-2 pr-2">Price</th>
              <th className="py-2 pr-2">Stock</th>
              <th className="py-2 pr-2">Category</th>
              <th className="py-2 pr-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const d = drafts[p.id] || {};
              const draftName = d.name ?? p.name;
              const draftDesc = d.description ?? p.description;
              const draftPrice = d.price ?? p.price;
              const draftStock = d.stock ?? p.stock;
              const draftCategoryId = d.categoryId ?? p.categoryId ?? '';
              const draftImageUrl = d.imageUrl ?? p.imageUrl;
              return (
                <tr key={p.id} className="border-b align-top">
                  <td className="py-2 pr-2">
                    {p._editing ? (
                      <div className="space-y-1">
                        <input aria-label={`Edit name ${p.name}`} value={draftName} onChange={e => setDrafts(prev => ({ ...prev, [p.id]: { ...prev[p.id], name: e.target.value } }))} disabled={p._pending} className="w-full rounded border border-gray-300 px-2 py-1 text-sm" />
                        <input aria-label={`Edit description ${p.name}`} value={draftDesc} onChange={e => setDrafts(prev => ({ ...prev, [p.id]: { ...prev[p.id], description: e.target.value } }))} disabled={p._pending} className="w-full rounded border border-gray-300 px-2 py-1 text-sm" />
                        <input aria-label={`Edit image URL ${p.name}`} value={draftImageUrl} onChange={e => setDrafts(prev => ({ ...prev, [p.id]: { ...prev[p.id], imageUrl: e.target.value } }))} disabled={p._pending} className="w-full rounded border border-gray-300 px-2 py-1 text-sm" />
                        {p._error && <p role="alert" className="text-xs text-red-600 mt-1">{p._error}</p>}
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-gray-600 truncate" title={p.description}>{p.description}</div>
                      </div>
                    )}
                  </td>
                  <td className="py-2 pr-2 w-24">
                    {p._editing ? (
                      <input aria-label={`Edit price ${p.name}`} type="number" min={0} step={0.01} value={draftPrice} onChange={e => setDrafts(prev => ({ ...prev, [p.id]: { ...prev[p.id], price: Number(e.target.value) } }))} disabled={p._pending} className="w-full rounded border border-gray-300 px-2 py-1 text-sm" />
                    ) : (
                      `$${p.price.toFixed(2)}`
                    )}
                  </td>
                  <td className="py-2 pr-2 w-24">
                    {p._editing ? (
                      <input aria-label={`Edit stock ${p.name}`} type="number" min={0} step={1} value={draftStock} onChange={e => setDrafts(prev => ({ ...prev, [p.id]: { ...prev[p.id], stock: Number(e.target.value) } }))} disabled={p._pending} className="w-full rounded border border-gray-300 px-2 py-1 text-sm" />
                    ) : (
                      p.stock
                    )}
                  </td>
                  <td className="py-2 pr-2 w-48">
                    {p._editing ? (
                      <select value={draftCategoryId} onChange={e => setDrafts(prev => ({ ...prev, [p.id]: { ...prev[p.id], categoryId: e.target.value || undefined } }))} disabled={p._pending} className="w-full rounded border border-gray-300 px-2 py-1 text-sm" aria-label={`Edit category ${p.name}`}>
                        <option value="">Unassigned</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    ) : (
                      categories.find(c => c.id === p.categoryId)?.name || 'Unassigned'
                    )}
                  </td>
                  <td className="py-2 pr-2 space-x-2">
                    {!p._editing && (
                      <>
                        <button type="button" onClick={() => startEdit(p.id)} disabled={p._pending} className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xs">Edit</button>
                        <button type="button" onClick={() => remove(p.id)} disabled={p._pending} className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-xs disabled:opacity-50">Delete</button>
                      </>
                    )}
                    {p._editing && (
                      <>
                        <button type="button" onClick={() => saveEdit(p.id)} disabled={p._pending} className="px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-xs disabled:opacity-50">Save</button>
                        <button type="button" onClick={() => cancelEdit(p.id)} disabled={p._pending} className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xs">Cancel</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default ProductManagement;
