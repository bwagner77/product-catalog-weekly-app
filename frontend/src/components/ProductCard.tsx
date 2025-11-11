import * as React from 'react';
import type { Product } from '../types/product';

export function formatPrice(value: number): string {
  if (Number.isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const titleId = `product-title-${product.id}`;
  const descId = `product-desc-${product.id}`;
  return (
    <article
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
      aria-labelledby={titleId}
      aria-describedby={descId}
      role="article"
    >
      <header className="mb-2 flex items-start justify-between">
        <h2 id={titleId} className="text-lg font-semibold text-gray-900">
          {product.name}
        </h2>
        <span className="ml-4 shrink-0 text-right text-indigo-600 font-medium">
          {formatPrice(product.price)}
        </span>
      </header>
      <p id={descId} className="text-sm text-gray-700">
        {product.description}
      </p>
    </article>
  );
};

export default ProductCard;
