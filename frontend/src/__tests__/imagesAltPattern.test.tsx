import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types/product';

const product: Product = {
  id: 'p1',
  name: 'Pattern Product',
  description: 'Alt pattern validation',
  price: 3.21,
  categoryId: 'c1',
  stock: 2,
  imageUrl: 'images/product3.jpg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

describe('[US8] Alt fallback pattern', () => {
  it('uses en dash pattern "<name> – image unavailable" on error', async () => {
    render(<ProductCard product={product} />);
    const img = screen.getByTestId('product-image');
    expect(img).toHaveAttribute('alt', product.name);
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.error(img);
    expect(img).toHaveAttribute('alt', `${product.name} – image unavailable`);
    // Ensure en dash (U+2013) present not a hyphen
    const alt = img.getAttribute('alt') || '';
    expect(alt.includes(' – ')).toBe(true);
    expect(alt).not.toContain(' - image unavailable');
  });
});
