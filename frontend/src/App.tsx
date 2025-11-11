import React from 'react';
import ProductList from './pages/ProductList';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold">Product Catalog</h1>
      </header>
      <main className="p-4">
        <ProductList />
      </main>
    </div>
  );
}
