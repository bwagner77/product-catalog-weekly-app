import { render, screen } from '@testing-library/react';
import React from 'react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types/product';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: '00000000-0000-0000-0000-000000000000',
    name: 'Sample',
    description: 'Desc',
    price: 9.99,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('ProductCard long text rendering', () => {
  it('renders very long words without crashing and applies wrapping classes', () => {
    const longWord = 'L'.repeat(500);
    const longSentence = 'D'.repeat(800);

    const product = makeProduct({
      name: longWord,
      description: longSentence,
    });

    render(<ProductCard product={product} />);

    const heading = screen.getByRole('heading', { name: longWord });
    const description = screen.getByText(longSentence);

    // Assert text is present
    expect(heading).toBeInTheDocument();
    expect(description).toBeInTheDocument();

    // Structural assertions to ensure wrapping behavior is enabled via Tailwind
    expect(heading).toHaveClass('break-words');
    expect(heading).toHaveClass('min-w-0');
    expect(heading).toHaveClass('flex-1');
    expect(description).toHaveClass('break-words');
  });
});
