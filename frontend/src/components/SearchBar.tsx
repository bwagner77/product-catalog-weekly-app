import * as React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <label className="block mb-2" aria-label="Search products">
      <span className="sr-only">Search products</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search…"
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-describedby="search-help"
      />
      <small id="search-help" className="block mt-1 text-xs text-gray-500">
        Type a phrase to filter by name or description.
      </small>
    </label>
  );
};

export default SearchBar;