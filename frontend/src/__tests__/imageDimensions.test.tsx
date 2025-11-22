import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types/product';

const product: Product = {
  id: 'p1',
  name: 'Sample Product',
  description: 'Desc',
  price: 12.34,
  categoryId: 'c1',
  stock: 3,
  imageUrl: 'images/product1.jpg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

describe('[US8] Image dimensions & CLS prevention', () => {
  it('reserves a 200x200 area and prevents layout shift on fallback', async () => {
    render(<ProductCard product={product} />);
    const container = screen.getByTestId('product-image').parentElement as HTMLElement;
    expect(container.className).toContain('w-[200px]');
    expect(container.className).toContain('h-[200px]');

    const img = screen.getByTestId('product-image');
    expect(img).toHaveAttribute('src', product.imageUrl);
    // Simulate failure -> fallback
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.error(img);
    expect(img).toHaveAttribute('src', 'images/fallback.jpg');
    // Container size remains unchanged (class-based assertion due to JSDOM lack of layout)
    expect(container.className).toContain('w-[200px]');
    expect(container.className).toContain('h-[200px]');
  });
});
