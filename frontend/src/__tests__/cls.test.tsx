import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types/product';

// Simple CLS proxy: track number of src changes that alter container size (expected 0)
let clsScore = 0;

const product: Product = {
  id: 'p1',
  name: 'CLS Product',
  description: 'Desc',
  price: 1.11,
  categoryId: 'c1',
  stock: 1,
  imageUrl: 'images/product2.jpg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

describe('[Perf/A11y] Cumulative Layout Shift proxy', () => {
  it('fallback does not change reserved dimensions; clsScore < 0.1', async () => {
    render(<ProductCard product={product} />);
    const img = screen.getByTestId('product-image');
    const container = img.parentElement as HTMLElement;
    const initialClass = container.className;
    // Simulate error to force fallback
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.error(img);
    const afterClass = container.className;
    if (initialClass !== afterClass) clsScore += 0.1; // would indicate shift; we expect no change
    expect(clsScore).toBeLessThan(0.1);
    expect(container.className).toContain('w-[200px]');
    expect(container.className).toContain('h-[200px]');
  });
});
