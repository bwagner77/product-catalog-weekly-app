import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

const orderResponse = {
  id: 'order-2',
  total: 7,
  items: [
    { productId: 'p1', name: 'Solo Product', price: 7, quantity: 1 }
  ],
  status: 'submitted',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const productsResponse = [
  { id: 'p1', name: 'Solo Product', description: 'Only one left', price: 7, stock: 1, imageUrl: 'solo.jpg' }
];

const categoriesResponse: any[] = [];

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

describe('Dynamic stock update post-order (T096, SC-037/SC-038)', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    // @ts-expect-error override global
    global.fetch = mockFetch;
    localStorage.setItem('app_cart_v1', JSON.stringify({
      version: 1,
      items: [
        { productId: 'p1', name: 'Solo Product', price: 7, quantity: 1, stock: 1 }
      ]
    }));
  });

  it('disables button and shows Out of stock immediately after successful order', async () => {
    render(<App />);
    // Precondition: button enabled and text Add to cart
    const btn = await screen.findByRole('button', { name: /add to cart/i });
    expect(btn).toBeEnabled();
    const checkout = screen.getByTestId('checkout-btn');
    fireEvent.click(checkout);
    await waitFor(() => screen.getByTestId('order-confirmation'));
    // After order placed event, product card should reflect stock 0
    const disabledBtn = await screen.findByRole('button', { name: /out of stock/i });
    expect(disabledBtn).toBeDisabled();
    expect(disabledBtn).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId('out-of-stock').textContent).toMatch(/Out of stock/i);
  });
});
