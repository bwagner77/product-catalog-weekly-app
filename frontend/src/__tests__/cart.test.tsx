import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import App from '../App';

// Mock fetch for products list with limited seed subset including stock variations
const products = [
  {
    id: 'p-1', name: 'Alpha', description: 'A', price: 5, stock: 3, imageUrl: 'images/product1.jpg'
  },
  {
    id: 'p-2', name: 'Beta', description: 'B', price: 7, stock: 0, imageUrl: 'images/product2.jpg'
  }
];

beforeEach(() => {
  (global.fetch as any) = (input: RequestInfo) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('/api/products')) {
      return Promise.resolve({ ok: true, json: async () => products });
    }
    if (url.includes('/api/categories')) {
      return Promise.resolve({ ok: true, json: async () => [] });
    }
    return Promise.resolve({ ok: true, json: async () => [] });
  };
  localStorage.clear();
});

describe('[US6] Cart operations', () => {
  it('add to cart increments count and persists after re-render', async () => {
    const { unmount } = render(<App />);
    await screen.findByRole('list', { name: /product list/i });
    const addBtn = (await screen.findAllByTestId('add-to-cart-btn'))[0];
    fireEvent.click(addBtn);
    expect(screen.getByTestId('cart-count')).toHaveTextContent('Cart: 1');
    // Simulate refresh by unmounting then mounting new instance
    unmount();
    render(<App />);
    await screen.findByRole('list', { name: /product list/i });
    expect(screen.getByTestId('cart-count')).toHaveTextContent('Cart: 1');
  });

  it('out-of-stock product button disabled and cannot add', async () => {
    render(<App />);
    await screen.findByRole('list', { name: /product list/i });
    const buttons = await screen.findAllByTestId('add-to-cart-btn');
    const outBtn = buttons[1];
    expect(outBtn).toBeDisabled();
    fireEvent.click(outBtn);
    expect(screen.getByTestId('cart-count')).toHaveTextContent('Cart: 0');
  });

  it('update quantity respects stock limit', async () => {
    render(<App />);
    await screen.findByRole('list', { name: /product list/i });
    const addBtn = (await screen.findAllByTestId('add-to-cart-btn'))[0];
    fireEvent.click(addBtn); // qty 1
    fireEvent.click(addBtn); // qty 2
    const qtyInput = (await screen.findAllByTestId('cart-qty-input'))[0];
    fireEvent.change(qtyInput, { target: { value: '5' } }); // exceeds stock (3)
    expect(qtyInput).toHaveValue(2); // unchanged
  });

  it('remove item and clear cart work', async () => {
    render(<App />);
    await screen.findByRole('list', { name: /product list/i });
    const addBtn = (await screen.findAllByTestId('add-to-cart-btn'))[0];
    fireEvent.click(addBtn);
    expect(screen.getByTestId('cart-count')).toHaveTextContent('Cart: 1');
    const removeBtn = await screen.findByTestId('remove-item-btn');
    fireEvent.click(removeBtn);
    expect(screen.getByTestId('cart-count')).toHaveTextContent('Cart: 0');
    fireEvent.click(addBtn);
    fireEvent.click(screen.getByTestId('clear-cart-btn'));
    expect(screen.getByTestId('empty-cart')).toBeInTheDocument();
  });
});
