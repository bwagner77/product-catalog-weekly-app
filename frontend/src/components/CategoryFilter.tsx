import * as React from 'react';
import type { Category } from '../types/category';

interface CategoryFilterProps {
  categories: Category[];
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, value, onChange }) => {
  return (
    <label className="block mb-2" aria-label="Filter by category">
      <span className="sr-only">Filter by category</span>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-describedby="category-filter-help"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <small id="category-filter-help" className="block mt-1 text-xs text-gray-500">
        Select a category to narrow results.
      </small>
    </label>
  );
};

export default CategoryFilter;