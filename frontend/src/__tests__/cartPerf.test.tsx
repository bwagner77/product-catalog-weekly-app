import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { CartProvider, useCart } from '../hooks/useCart';
import type { Product } from '../types/product';
import { render } from '@testing-library/react';

// T181: Cart latency perf test (SC-031)
// Measures add/update/remove operation durations using performance.now().
// Threshold: median & p95 < 500ms (expected to be far lower in test env).

const sampleProduct: Product = {
  id: 'perf-1',
  name: 'PerfProd',
  description: 'D',
  price: 10,
  stock: 50,
  imageUrl: 'images/p.jpg',
  categoryId: 'c-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

function PerfHarness() {
  const cart = useCart();
  (window as any).__cart = cart; // expose for test control
  return <div />;
}

function stats(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  return { median, p95 };
}

describe('Cart performance (SC-031)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('add/update/remove operations meet latency thresholds', () => {
    const { unmount } = render(<CartProvider><PerfHarness /></CartProvider>);
    const cartApi = (window as any).__cart as ReturnType<typeof useCart>;
    const addDur: number[] = []; const updDur: number[] = []; const remDur: number[] = [];
    for (let i = 0; i < 40; i++) {
      // add
      const t0 = performance.now();
      cartApi.add(sampleProduct, 1);
      addDur.push(performance.now() - t0);
    }
    const productId = sampleProduct.id;
    for (let i = 0; i < 30; i++) {
      const t0 = performance.now();
      cartApi.update(productId, i + 1);
      updDur.push(performance.now() - t0);
    }
    for (let i = 0; i < 30; i++) {
      const t0 = performance.now();
      cartApi.remove(productId);
      remDur.push(performance.now() - t0);
      // re-add for next removal
      cartApi.add(sampleProduct, 1);
      remDur[remDur.length - 1] = remDur[remDur.length - 1];
    }
    const addStats = stats(addDur);
    const updStats = stats(updDur);
    const remStats = stats(remDur);
    // Assertions (far below thresholds expected)
    expect(addStats.median).toBeLessThan(500);
    expect(addStats.p95).toBeLessThan(500);
    expect(updStats.median).toBeLessThan(500);
    expect(updStats.p95).toBeLessThan(500);
    expect(remStats.median).toBeLessThan(500);
    expect(remStats.p95).toBeLessThan(500);
    unmount();
  });
});
