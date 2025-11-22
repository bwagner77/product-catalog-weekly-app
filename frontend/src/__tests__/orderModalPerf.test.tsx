import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../App';

// T182: Order confirmation latency test (SC-032)
// Measures duration from clicking Place Order to order modal rendered.
// Threshold: <= 1000ms (p95), expecting << in test environment.

beforeEach(() => {
  localStorage.clear();
  // Mock fetch for products & order endpoint
  (global.fetch as any) = (input: RequestInfo) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('/api/products')) {
      return Promise.resolve({ ok: true, json: async () => [
        { id: 'p-1', name: 'Prod', description: 'D', price: 5, stock: 5, imageUrl: 'images/product1.jpg', categoryId: 'c-1' }
      ] });
    }
    if (url.includes('/api/orders')) {
      return Promise.resolve({ ok: true, json: async () => ({
        id: 'o-1',
        items: [{ productId: 'p-1', name: 'Prod', price: 5, quantity: 1 }],
        total: 5,
        createdAt: new Date().toISOString()
      }) });
    }
    if (url.includes('/api/categories')) {
      return Promise.resolve({ ok: true, json: async () => [] });
    }
    return Promise.resolve({ ok: true, json: async () => [] });
  };
});

function stats(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  return { median, p95 };
}

describe('Order confirmation performance (SC-032)', () => {
  it('submit-to-modal render latency within threshold', async () => {
    const iterations = 25;
    const durations: number[] = [];
    for (let i = 0; i < iterations; i++) {
      const { unmount } = render(<App />);
      await screen.findByRole('list', { name: /product list/i });
      const addBtn = (await screen.findAllByTestId('add-to-cart-btn'))[0];
      fireEvent.click(addBtn);
      const checkout = screen.getByTestId('checkout-btn');
      const t0 = performance.now();
      fireEvent.click(checkout);
      // Use waitFor to reliably wait for modal
      await waitFor(() => {
        expect(screen.getByTestId('order-confirmation')).toBeInTheDocument();
      }, { timeout: 1500 });
      const dt = performance.now() - t0;
      durations.push(dt);
      unmount();
    }
    const { median, p95 } = stats(durations);
    expect(median).toBeLessThan(1000);
    expect(p95).toBeLessThan(1000);
  });
});
