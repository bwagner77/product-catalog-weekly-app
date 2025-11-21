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
  const [src, setSrc] = React.useState(product.imageUrl);
  const [failed, setFailed] = React.useState(false);
  const onError = () => {
    if (!failed) {
      setFailed(true);
      setSrc('images/fallback.jpg');
    }
  };
  const alt = failed ? `${product.name} – image unavailable` : product.name;
  return (
    <article
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
      aria-labelledby={titleId}
      aria-describedby={descId}
      role="article"
    >
      <div className="mb-3 w-[200px] h-[200px] bg-gray-50 border border-gray-100 rounded flex items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img
          src={src}
          onError={onError}
          alt={alt}
          className="object-cover w-full h-full"
          data-testid="product-image"
        />
      </div>
      <header className="mb-2 flex items-start justify-between min-w-0">
        <h2
          id={titleId}
          className="text-lg font-semibold text-gray-900 flex-1 min-w-0 break-words"
        >
          {product.name}
        </h2>
        <span className="ml-4 shrink-0 text-right text-indigo-600 font-medium">
          {formatPrice(product.price)}
        </span>
      </header>
      <p id={descId} className="text-sm text-gray-700 break-words">
        {product.description}
      </p>
      {product.stock === 0 && (
        <p className="mt-2 text-xs font-medium text-red-600" data-testid="out-of-stock">Out of stock</p>
      )}
    </article>
  );
};

export default ProductCard;
