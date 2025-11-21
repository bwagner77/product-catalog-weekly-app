import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard, { formatPrice } from '../components/ProductCard';

const baseProduct = {
  id: 'p1',
  name: 'Test Product',
  description: 'A product for testing.',
  price: 12.5,
  stock: 3,
  categoryId: 'c1',
  imageUrl: 'images/product1.jpg',
};

describe('[US1] ProductCard', () => {
  it('formats price with $ and two decimals', () => {
    expect(formatPrice(12)).toBe('$12.00');
    expect(formatPrice(12.5)).toBe('$12.50');
    expect(formatPrice(NaN)).toBe('$0.00');
  });

  it('renders name, description and price', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText(baseProduct.name)).toBeInTheDocument();
    expect(screen.getByText(baseProduct.description)).toBeInTheDocument();
    expect(screen.getByText('$12.50')).toBeInTheDocument();
    const img = screen.getByTestId('product-image');
    expect(img).toHaveAttribute('alt', baseProduct.name);
  });

  it('falls back to placeholder with alt pattern when image fails', () => {
    render(<ProductCard product={baseProduct} />);
    const img = screen.getByTestId('product-image');
    fireEvent.error(img);
    expect(img).toHaveAttribute('src', 'images/fallback.jpg');
    expect(img.getAttribute('alt')).toMatch(/image unavailable$/i);
  });
});
