import * as React from 'react';
import type { Category, CategoryInput } from '../types/category';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../api/categories';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

interface EditableCategory extends Category {
  _editing?: boolean;
  _pending?: boolean;
  _error?: string | null;
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = React.useState<EditableCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [creatingName, setCreatingName] = React.useState('');
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});

  async function refresh() {
    try {
      setLoading(true);
      setError(null);
      const data = await listCategories();
      setCategories(data.map((c) => ({ ...c })));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load categories';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!creatingName.trim()) {
      setCreateError('Name required');
      return;
    }
    setBusy(true);
    setCreateError(null);
    try {
      const created = await createCategory({ name: creatingName.trim() } as CategoryInput);
      setCategories((prev) => [...prev, { ...created }]);
      setCreatingName('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Create failed';
      setCreateError(msg);
    } finally {
      setBusy(false);
    }
  }

  function startEdit(id: string) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, _editing: true, _error: null } : c)));
    setDrafts((d) => ({ ...d, [id]: categories.find((c) => c.id === id)?.name || '' }));
  }

  function cancelEdit(id: string) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, _editing: false, _error: null } : c)));
    setDrafts((d) => {
      const copy = { ...d };
      delete copy[id];
      return copy;
    });
  }

  async function saveEdit(id: string, name: string) {
    if (!name.trim()) {
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, _error: 'Name required' } : c)));
      return;
    }
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, _pending: true, _error: null } : c)));
    try {
      const updated = await updateCategory(id, { name: name.trim() });
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...updated } : c)));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Update failed';
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, _error: msg } : c)));
    } finally {
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, _pending: false, _editing: false } : c)));
      setDrafts((d) => {
        const copy = { ...d };
        delete copy[id];
        return copy;
      });
    }
  }

  async function remove(id: string) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, _pending: true, _error: null } : c)));
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Delete failed';
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, _error: msg } : c)));
    } finally {
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, _pending: false } : c)));
    }
  }

  return (
    <section aria-labelledby="category-mgmt-heading" className="space-y-6">
      <h2 id="category-mgmt-heading" className="text-lg font-semibold">Category Management</h2>
      <form onSubmit={handleCreate} aria-label="Create category" className="flex gap-3 items-start">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1" htmlFor="new-category-name">Name</label>
          <input
            id="new-category-name"
            type="text"
            value={creatingName}
            onChange={(e) => setCreatingName(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Electronics"
            aria-describedby="create-category-help"
            disabled={busy}
          />
          <small id="create-category-help" className="block mt-1 text-xs text-gray-500">Add a new unique category name.</small>
          {createError && <p role="alert" className="text-xs text-red-600 mt-1">{createError}</p>}
        </div>
        <button
          type="submit"
          disabled={busy}
          className="px-4 py-2 rounded bg-indigo-600 text-white text-sm disabled:opacity-50"
        >Create</button>
      </form>
      {loading && <Loading message="Loading categories…" />}
      {!loading && error && <ErrorMessage message={error} />}
      {!loading && !error && categories.length === 0 && <p>No categories defined.</p>}
      {!loading && !error && categories.length > 0 && (
        <table className="w-full text-sm" aria-label="Category list">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-2">Name</th>
              <th className="py-2 pr-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => {
              const draftName = drafts[c.id] ?? c.name;
              return (
                <tr key={c.id} className="border-b align-top">
                  <td className="py-2 pr-2">
                    {c._editing ? (
                      <div>
                        <input
                          aria-label={`Edit category ${c.name}`}
                          value={draftName}
                          onChange={(e) => setDrafts((d) => ({ ...d, [c.id]: e.target.value }))}
                          disabled={c._pending}
                          className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {c._error && <p role="alert" className="text-xs text-red-600 mt-1">{c._error}</p>}
                      </div>
                    ) : (
                      <span>{c.name}</span>
                    )}
                  </td>
                  <td className="py-2 pr-2 space-x-2">
                    {!c._editing && (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(c.id)}
                          disabled={c._pending}
                          className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xs"
                        >Edit</button>
                        <button
                          type="button"
                          onClick={() => remove(c.id)}
                          disabled={c._pending}
                          className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-xs disabled:opacity-50"
                        >Delete</button>
                      </>
                    )}
                    {c._editing && (
                      <>
                        <button
                          type="button"
                          onClick={() => saveEdit(c.id, draftName)}
                          disabled={c._pending}
                          className="px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-xs disabled:opacity-50"
                        >Save</button>
                        <button
                          type="button"
                          onClick={() => cancelEdit(c.id)}
                          disabled={c._pending}
                          className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xs"
                        >Cancel</button>
                      </>
                    )}
                    {c._error && !c._editing && <p role="alert" className="text-xs text-red-600 mt-1">{c._error}</p>}
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

export default CategoryManagement;