import * as React from 'react';
import type { Product } from '../types/product';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  stock: number; // snapshot of stock at add time for gating
}

interface CartState {
  items: CartItem[];
  version: number;
}

const STORAGE_KEY = 'app_cart_v1';
const SCHEMA_VERSION = 1;

function loadCart(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], version: SCHEMA_VERSION };
    const parsed = JSON.parse(raw) as CartState;
    if (parsed.version !== SCHEMA_VERSION || !Array.isArray(parsed.items)) {
      return { items: [], version: SCHEMA_VERSION };
    }
    return { items: parsed.items, version: SCHEMA_VERSION };
  } catch {
    return { items: [], version: SCHEMA_VERSION };
  }
}

function persist(state: CartState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore persistence errors
  }
}

export interface UseCartApi {
  items: CartItem[];
  add: (product: Product, qty?: number) => { ok: boolean; error?: string };
  update: (productId: string, qty: number) => { ok: boolean; error?: string };
  remove: (productId: string) => void;
  clear: () => void;
  count: number;
  total: number;
}

const CartContext = React.createContext<UseCartApi | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = React.useState<CartItem[]>(() => loadCart().items);

  React.useEffect(() => {
    persist({ items, version: SCHEMA_VERSION });
  }, [items]);

  const add: UseCartApi['add'] = (product, qty = 1) => {
    if (product.stock <= 0) return { ok: false, error: 'Out of stock' };
    if (qty > product.stock) return { ok: false, error: 'Quantity exceeds stock' };
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (!existing) {
        return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: qty, stock: product.stock }];
      }
      const newQty = existing.quantity + qty;
      if (newQty > existing.stock) return prev; // reject silently (error already above)
      return prev.map(i => i.productId === product.id ? { ...i, quantity: newQty } : i);
    });
    return { ok: true };
  };

  const update: UseCartApi['update'] = (productId, qty) => {
    if (qty <= 0) return { ok: false, error: 'Quantity must be >=1' };
    setItems(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (!existing) return prev;
      if (qty > existing.stock) return prev; // reject
      return prev.map(i => i.productId === productId ? { ...i, quantity: qty } : i);
    });
    const item = items.find(i => i.productId === productId);
    if (item && qty > item.stock) return { ok: false, error: 'Quantity exceeds stock' };
    return { ok: true };
  };

  const remove: UseCartApi['remove'] = (productId) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  };

  const clear: UseCartApi['clear'] = () => setItems([]);

  const count = items.reduce((acc, i) => acc + i.quantity, 0);
  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const value: UseCartApi = { items, add, update, remove, clear, count, total };
  return React.createElement(CartContext.Provider, { value }, children);
};

export function useCart(): UseCartApi {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
