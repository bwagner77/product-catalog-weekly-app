import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ProductCard from '../components/ProductCard';

// Simulated timing test: validates fallback substitution executes synchronously (<1000ms budget)
describe('[T111] Image timing & fallback substitution', () => {
  it('swaps to fallback immediately (<1000ms) on error with correct alt', () => {
    const product = { id: 'p1', name: 'Timing Product', description: 'Desc', price: 1, stock: 2, imageUrl: 'images/broken.jpg' };
    const start = performance.now();
    render(<ProductCard product={product} />);
    const img = screen.getByTestId('product-image');
    // Force error
    fireEvent.error(img);
    const end = performance.now();
    expect(img).toHaveAttribute('src', 'images/fallback.jpg');
    expect(img).toHaveAttribute('alt', 'Timing Product – image unavailable');
    const elapsed = end - start;
    // Local synchronous swap should be << 1000ms threshold (SC-017 / SC-018 guidance)
    expect(elapsed).toBeLessThan(1000);
  });
});
