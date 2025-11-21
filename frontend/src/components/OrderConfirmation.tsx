import React from 'react';
import type { Order } from '../types/order';

interface Props {
  order: Order | null;
  onClose: () => void;
}

const OrderConfirmation: React.FC<Props> = ({ order, onClose }) => {
  if (!order) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-confirm-title"
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      data-testid="order-confirmation"
    >
      <div className="bg-white rounded shadow max-w-md w-full p-4 space-y-3">
        <div className="flex items-start justify-between">
          <h2 id="order-confirm-title" className="text-lg font-semibold">Order Placed</h2>
          <button type="button" aria-label="Close confirmation" onClick={onClose} className="text-sm px-2 py-1 rounded border hover:bg-gray-50">×</button>
        </div>
        <p className="text-sm" data-testid="order-id">Order ID: <span className="font-mono" aria-label="order id value">{order.id}</span></p>
        <p className="text-sm" data-testid="order-total">Total: ${order.total.toFixed(2)}</p>
        <ul className="divide-y" data-testid="order-items">
          {order.items.map(it => (
            <li
              key={it.productId}
              className="py-1 text-xs flex justify-between"
              aria-label={it.name}
            >
              <span className="truncate" title={it.name}>{it.name}</span>
              <span>{it.quantity} × ${it.price.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-gray-500" data-testid="snapshot-note">Prices captured at time of order and may not reflect future changes.</p>
      </div>
    </div>
  );
};

export default OrderConfirmation;
