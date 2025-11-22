import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductList from '../pages/ProductList';

const makeProduct = (id: string, price: number) => ({
  id,
  name: `Product ${id}`,
  description: `Description ${id}`,
  price,
  stock: 5,
  categoryId: 'cat1',
  imageUrl: `images/${id}.jpg`,
});

describe('[US1] ProductList page', () => {
  it('renders a list of products fetched from /api/products with formatted prices', async () => {
    const products = [makeProduct('p1', 10), makeProduct('p2', 12.5)];
    vi.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true,
      json: async () => products,
    });

    render(<ProductList />);
    // Wait for list
    const list = await screen.findByRole('list', { name: /product list/i });
    expect(list).toBeInTheDocument();
    // Two items
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    // Prices formatted
    expect(screen.getByText('$10.00')).toBeInTheDocument();
    expect(screen.getByText('$12.50')).toBeInTheDocument();
  });

  it('shows empty state when no products', async () => {
    vi.spyOn(global, 'fetch' as any).mockResolvedValue({ ok: true, json: async () => [] });
    render(<ProductList />);
    expect(await screen.findByText(/no products available/i)).toBeInTheDocument();
  });
});
