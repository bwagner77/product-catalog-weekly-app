import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import ProductList from '../pages/ProductList';
import type { Product } from '../types/product';
import type { Category } from '../types/category';
import { fireEvent } from '@testing-library/dom';

// Mock API modules used by ProductList
vi.mock('../api/products', () => ({ fetchProducts: vi.fn() }));
vi.mock('../api/categories', () => ({ listCategories: vi.fn() }));

import { fetchProducts } from '../api/products';
import { listCategories } from '../api/categories';

const allProducts: Product[] = [
  {
    id: 'p1',
    name: 'Phone XL',
    description: 'Large phone with big screen',
    price: 999.99,
    categoryId: 'c-electronics',
    stock: 5,
    imageUrl: 'http://example.com/phone-xl.png',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    name: 'Phone Mini',
    description: 'Compact phone',
    price: 599.0,
    categoryId: 'c-electronics',
    stock: 8,
    imageUrl: 'http://example.com/phone-mini.png',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p3',
    name: 'Coffee Mug',
    description: 'Ceramic mug',
    price: 12.5,
    categoryId: 'c-kitchen',
    stock: 30,
    imageUrl: 'http://example.com/mug.png',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const categories: Category[] = [
  { id: 'c-electronics', name: 'Electronics', createdAt: '', updatedAt: '' },
  { id: 'c-kitchen', name: 'Kitchen', createdAt: '', updatedAt: '' },
];

beforeEach(() => {
  vi.clearAllMocks();
  (listCategories as any).mockResolvedValue(categories);
});

describe('[US5] Product search & category filtering (ProductList)', () => {
  it('renders default product listing (initial fetch)', async () => {
    (fetchProducts as any).mockResolvedValueOnce(allProducts);
    render(<ProductList />);
    await waitFor(() => {
      expect(screen.getByRole('list', { name: 'Product list' })).toBeInTheDocument();
    });
    expect(screen.getAllByRole('listitem').length).toBe(3);
    expect((fetchProducts as any).mock.calls.length).toBe(1);
  });

  it('filters by search phrase only', async () => {
    // First call returns all; second call returns only phone-related products
    (fetchProducts as any)
      .mockResolvedValueOnce(allProducts)
      .mockResolvedValueOnce(allProducts.filter((p) => p.name.toLowerCase().includes('phone')));
    render(<ProductList />);
    await waitFor(() => expect((fetchProducts as any).mock.calls.length).toBe(1));
    const input = screen.getByPlaceholderText('Search…');
    fireEvent.change(input, { target: { value: 'phone' } });
    await waitFor(() => expect((fetchProducts as any).mock.calls.length).toBe(2));
    // Verify filtered render
    await waitFor(() => expect(screen.getAllByRole('listitem').length).toBe(2));
    const secondArgs = (fetchProducts as any).mock.calls[1][0];
    expect(secondArgs.search).toBe('phone');
    expect(secondArgs.categoryId).toBeUndefined();
  });

  it('filters by category only', async () => {
    (fetchProducts as any)
      .mockResolvedValueOnce(allProducts)
      .mockResolvedValueOnce(allProducts.filter((p) => p.categoryId === 'c-kitchen'));
    render(<ProductList />);
    await waitFor(() => expect((fetchProducts as any).mock.calls.length).toBe(1));
    const select = screen.getByRole('combobox', { name: 'Filter by category' });
    fireEvent.change(select, { target: { value: 'c-kitchen' } });
    await waitFor(() => expect((fetchProducts as any).mock.calls.length).toBe(2));
    await waitFor(() => expect(screen.getAllByRole('listitem').length).toBe(1));
    const secondArgs = (fetchProducts as any).mock.calls[1][0];
    expect(secondArgs.categoryId).toBe('c-kitchen');
    expect(secondArgs.search).toBeUndefined();
  });

  it('applies combined search + category filter (intersection)', async () => {
    (fetchProducts as any)
      .mockResolvedValueOnce(allProducts)
      .mockResolvedValueOnce(allProducts.filter((p) => p.categoryId === 'c-electronics' && p.name.includes('Mini')));
    render(<ProductList />);
    await waitFor(() => expect((fetchProducts as any).mock.calls.length).toBe(1));
    fireEvent.change(screen.getByPlaceholderText('Search…'), { target: { value: 'Mini' } });
    await waitFor(() => expect((fetchProducts as any).mock.calls.length).toBe(2));
    // Now apply category filter triggers third fetch
    (fetchProducts as any).mockResolvedValueOnce(
      allProducts.filter((p) => p.categoryId === 'c-electronics' && p.name.toLowerCase().includes('mini'))
    );
    fireEvent.change(screen.getByRole('combobox', { name: 'Filter by category' }), { target: { value: 'c-electronics' } });
    await waitFor(() => expect((fetchProducts as any).mock.calls.length).toBe(3));
    await waitFor(() => expect(screen.getAllByRole('listitem').length).toBe(1));
    const thirdArgs = (fetchProducts as any).mock.calls[2][0];
    expect(thirdArgs.search).toBe('Mini');
    expect(thirdArgs.categoryId).toBe('c-electronics');
  });

  it('shows zero-results state distinct from empty catalog', async () => {
    (fetchProducts as any)
      .mockResolvedValueOnce(allProducts) // initial
      .mockResolvedValueOnce([]); // after search
    render(<ProductList />);
    await waitFor(() => expect((fetchProducts as any).mock.calls.length).toBe(1));
    fireEvent.change(screen.getByPlaceholderText('Search…'), { target: { value: 'zzzz' } });
    await waitFor(() => expect((fetchProducts as any).mock.calls.length).toBe(2));
    await waitFor(() => expect(screen.getByText('No matching products found.')).toBeInTheDocument());
  });
});
