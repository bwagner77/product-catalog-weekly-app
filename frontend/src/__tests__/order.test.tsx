import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

const orderResponse = {
  id: 'order-1',
  total: 15,
  items: [
    { productId: 'p1', name: 'Prod 1', price: 10, quantity: 1 },
    { productId: 'p2', name: 'Prod 2', price: 5, quantity: 1 }
  ],
  status: 'submitted',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const productsResponse = [
  { id: 'p1', name: 'Prod 1', description: 'D1', price: 10, stock: 5, imageUrl: 'img1.jpg' },
  { id: 'p2', name: 'Prod 2', description: 'D2', price: 5, stock: 3, imageUrl: 'img2.jpg' },
];

const categoriesResponse = [
  { id: 'c1', name: 'Cat 1', description: 'C1' },
  { id: 'c2', name: 'Cat 2', description: 'C2' },
];

const mockFetch = vi.fn(async (input: RequestInfo) => {
  const url = typeof input === 'string' ? input : (input as Request).url;
  if (url.includes('/api/orders')) {
    return { ok: true, json: async () => orderResponse } as Response;
  }
  if (url.includes('/api/products')) {
    return { ok: true, json: async () => productsResponse } as Response;
  }
  if (url.includes('/api/categories')) {
    return { ok: true, json: async () => categoriesResponse } as Response;
  }
  return { ok: false, status: 404, json: async () => ({}) } as Response;
});

describe('Order flow', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    // @ts-expect-error override global
    global.fetch = mockFetch;
    localStorage.setItem('app_cart_v1', JSON.stringify({
      version: 1,
      items: [
        { productId: 'p1', name: 'Prod 1', price: 10, quantity: 1, stock: 5 },
        { productId: 'p2', name: 'Prod 2', price: 5, quantity: 1, stock: 3 }
      ]
    }));
  });

  it('places order, shows confirmation, and clears cart', async () => {
    render(<App />);
    // Cart should show initial items count (2)
    expect(screen.getByTestId('cart-count').textContent).toMatch(/Cart: 2/);
    const btn = screen.getByTestId('checkout-btn');
    fireEvent.click(btn);
    await waitFor(() => screen.getByTestId('order-confirmation'));
    // Ensure an orders call occurred
    expect(mockFetch.mock.calls.some(call => (typeof call[0] === 'string' && call[0].includes('/api/orders')))).toBe(true);
    // Confirmation visible
    const confirmation = await screen.findByTestId('order-confirmation');
    expect(confirmation).toBeTruthy();
    expect(screen.getByTestId('order-id').textContent).toMatch(/order-1/);
    // Cart cleared
    expect(screen.getByTestId('cart-count').textContent).toMatch(/Cart: 0/);
    // Snapshot note present
    expect(screen.getByTestId('snapshot-note')).toBeTruthy();
  });
});
