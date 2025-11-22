import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import App from '../App';

// Helper percentile
function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}

describe('[Perf] Navigation latency (Products \u2194 Categories)', () => {
  it('median <=200ms and p95 <=400ms over >=50 direction switches', async () => {
    // Mock fetch responses for products & categories
    (global.fetch as any) = async (input: RequestInfo) => {
      const url = String(input);
      if (url.endsWith('/api/products')) {
        return { ok: true, json: async () => [
          { id: 'p1', name: 'Prod1', description: 'Desc', price: 1.23, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ] } as any;
      }
      if (url.endsWith('/api/categories')) {
        return { ok: true, json: async () => [
          { id: 'c1', name: 'Cat1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ] } as any;
      }
      if (url.endsWith('/api/orders')) {
        return { ok: true, json: async () => ({ id: 'o1', items: [], total: 0, status: 'submitted', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }) } as any;
      }
      return { ok: false, status: 404, json: async () => ({ error: 'not found' }) } as any;
    };
    // Seed admin token so categories nav is present under auth gating
    const header = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
    const payload = 'eyJyb2xlIjoiYWRtaW4iLCJleHAiOjk5OTk5OTk5OTl9';
    localStorage.setItem('shoply_admin_token', `${header}.${payload}.sig`);
    render(<App />);
    const navProducts = await screen.findByTestId('nav-products');
    const navCategories = screen.getByTestId('nav-categories');
    const user = userEvent.setup();

    // Ensure initial products view present
    await screen.findByRole('list', { name: /product list/i });

    const durations: number[] = [];
    const iterations = 30; // 30 pairs -> 60 direction switches (>=50)

    for (let i = 0; i < iterations; i++) {
      // Switch to categories
      const startCat = performance.now();
      await user.click(navCategories);
      // Wait for heading in categories view
      await screen.findByRole('heading', { name: /category management/i });
      durations.push(performance.now() - startCat);

      // Switch back to products
      const startProd = performance.now();
      await user.click(navProducts);
      await screen.findByRole('list', { name: /product list/i });
      durations.push(performance.now() - startProd);
    }

    // Compute metrics
    const med = percentile(durations, 50);
    const p95 = percentile(durations, 95);

    // Assertions per SC-023
    expect(med).toBeLessThanOrEqual(200);
    expect(p95).toBeLessThanOrEqual(400);
  }, 15000);
});
