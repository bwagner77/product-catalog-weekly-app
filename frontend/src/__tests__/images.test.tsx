import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ProductCard from '../components/ProductCard';

const baseProduct = {
  id: 'test-id',
  name: 'Test Product',
  description: 'Desc',
  price: 10,
  stock: 5,
  imageUrl: 'images/product1.jpg',
};

describe('[US8] Product images', () => {
  it('renders product image with initial alt text = name', () => {
    render(<ProductCard product={baseProduct} />);
    const img = screen.getByTestId('product-image');
    expect(img).toHaveAttribute('src', 'images/product1.jpg');
    expect(img).toHaveAttribute('alt', 'Test Product');
    const container = img.parentElement as HTMLElement;
    expect(container.className).toMatch(/w-\[200px\]/);
    expect(container.className).toMatch(/h-\[200px\]/);
  });

  it('falls back to fallback.jpg and alt pattern on error', () => {
    render(<ProductCard product={baseProduct} />);
    const img = screen.getByTestId('product-image');
    fireEvent.error(img);
    expect(img).toHaveAttribute('src', 'images/fallback.jpg');
    expect(img).toHaveAttribute('alt', 'Test Product – image unavailable');
  });

  it('out-of-stock message appears when stock is 0', () => {
    render(<ProductCard product={{ ...baseProduct, stock: 0 }} />);
    const badge = screen.getByTestId('out-of-stock');
    expect(badge).toHaveTextContent(/out of stock/i);
  });
});
