import React from 'react';
import ProductList from './pages/ProductList';
import CategoryManagement from './pages/CategoryManagement';
import ProductManagement from './pages/ProductManagement';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import { CartProvider, useCart } from './hooks/useCart';
import OrderConfirmation from './components/OrderConfirmation';
import type { Order } from './types/order';

type ActiveView = 'products' | 'categories' | 'productManagement' | 'login';

interface NavBarProps {
  active: ActiveView;
  onChange(view: ActiveView): void;
}

const NavBar: React.FC<NavBarProps> = ({ active, onChange }) => {
  const cart = useCart();
  const { authenticated, logout } = useAuth();
  return (
    <header className="p-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10" role="banner">
      <div className="flex items-center space-x-3" aria-label="Brand" data-testid="brand">
        {/* Inline SVG logo (placeholder) */}
        <div className="w-8 h-8 flex items-center justify-center rounded bg-indigo-600 text-white font-bold" aria-label="Shoply logo" data-testid="logo">S</div>
        <h1 className="text-xl font-semibold" data-testid="brand-name">Shoply Catalog</h1>
      </div>
      <nav aria-label="Primary" className="flex items-center space-x-2" role="navigation">
        <button
          type="button"
          onClick={() => onChange('products')}
          aria-current={active === 'products' ? 'page' : undefined}
          className={`px-3 py-1 rounded text-sm font-medium border ${active === 'products' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
          data-testid="nav-products"
        >Products</button>
        {authenticated && (
          <button
            type="button"
            onClick={() => onChange('categories')}
            aria-current={active === 'categories' ? 'page' : undefined}
            className={`px-3 py-1 rounded text-sm font-medium border ${active === 'categories' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
            data-testid="nav-categories"
          >Categories</button>
        )}
        {authenticated && (
          <button
            type="button"
            onClick={() => { logout(); onChange('login'); setTimeout(() => { const h = document.getElementById('login-heading'); h?.focus(); }, 0); }}
            className="px-3 py-1 rounded text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100"
            data-testid="nav-logout"
          >Logout</button>
        )}
        {authenticated && (
          <button
            type="button"
            onClick={() => onChange('productManagement')}
            aria-current={active === 'productManagement' ? 'page' : undefined}
            className={`px-3 py-1 rounded text-sm font-medium border ${active === 'productManagement' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
            data-testid="nav-product-mgmt"
          >Product Management</button>
        )}
        {!authenticated && (
          <button
            type="button"
            onClick={() => onChange('login')}
            aria-current={active === 'login' ? 'page' : undefined}
            className={`px-3 py-1 rounded text-sm font-medium border ${active === 'login' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
            data-testid="nav-login"
          >Login</button>
        )}
      </nav>
      <div className="flex items-center space-x-4" aria-label="Cart summary">
        <span className="text-sm" data-testid="cart-count">Cart: {cart.count}</span>
        <span className="text-sm" data-testid="cart-total">Total: ${cart.total.toFixed(2)}</span>
      </div>
    </header>
  );
};

const CartSidebar: React.FC<{ onCheckout: () => void; loading: boolean }> = ({ onCheckout, loading }) => {
  const { items, update, remove, clear } = useCart();
  return (
    <aside className="w-full md:w-64 md:border-l md:border-gray-200 md:pl-4 mt-6 md:mt-0" aria-label="Shopping cart">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold">Cart</h2>
        <button type="button" onClick={clear} className="text-xs text-red-600 hover:underline" data-testid="clear-cart-btn">Clear</button>
      </div>
      {items.length === 0 && <p className="text-xs text-gray-500" data-testid="empty-cart">Cart is empty.</p>}
      {items.length > 0 && (
        <ul className="space-y-2" data-testid="cart-items">
          {items.map(i => (
            <li key={i.productId} className="border rounded p-2 bg-white" aria-label={`Cart item ${i.name}`}>
              <p className="text-xs font-medium truncate" title={i.name}>{i.name}</p>
              <p className="text-xs">${i.price.toFixed(2)} x {i.quantity} = ${(i.price * i.quantity).toFixed(2)}</p>
              <div className="mt-1 flex items-center space-x-1">
                <button type="button" aria-label={`Remove ${i.name}`} onClick={() => remove(i.productId)} className="text-xs px-2 py-1 border rounded hover:bg-gray-50" data-testid="remove-item-btn">Remove</button>
                <input
                  type="number"
                  min={1}
                  max={i.stock}
                  value={i.quantity}
                  onChange={e => update(i.productId, Number(e.target.value))}
                  className="w-16 text-xs border rounded px-1 py-0.5"
                  data-testid="cart-qty-input"
                />
              </div>
              {i.quantity > i.stock && (
                <p className="text-[10px] text-red-600" data-testid="qty-error">Exceeds stock</p>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4">
        <button
          type="button"
          disabled={items.length === 0 || loading}
          onClick={onCheckout}
          className="text-xs px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-40"
          data-testid="checkout-btn"
          aria-disabled={items.length === 0 || loading}
        >
          {loading ? 'Placing…' : 'Place Order'}
        </button>
      </div>
    </aside>
  );
};

function InnerApp() {
  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(false);
  const cart = useCart();
  const [active, setActive] = React.useState<ActiveView>('products');
  const { authenticated } = useAuth();

  const checkout = async () => {
    if (cart.items.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart.items.map(i => ({ productId: i.productId, quantity: i.quantity })) }),
      });
      if (!res.ok) {
        // eslint-disable-next-line no-console
        console.error('Order failed', res.status);
        setLoading(false);
        return;
      }
      const data: Order = await res.json();
      setOrder(data);
      cart.clear();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Order error', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <NavBar active={active} onChange={setActive} />
      <div className="flex-1 p-4 md:flex md:space-x-6" aria-live="polite" aria-relevant="additions removals">
        <div className="flex-1" data-testid="active-view">
          {active === 'products' && <ProductList />}
          {active === 'login' && !authenticated && <Login onSuccess={() => setActive('categories')} focusOnMount />}
          {active === 'categories' && (
            <PrivateRoute>
              <CategoryManagement />
            </PrivateRoute>
          )}
          {active === 'productManagement' && (
            <PrivateRoute>
              <ProductManagement />
            </PrivateRoute>
          )}
        </div>
        <CartSidebar onCheckout={checkout} loading={loading} />
      </div>
      <OrderConfirmation order={order} onClose={() => setOrder(null)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <InnerApp />
      </CartProvider>
    </AuthProvider>
  );
}
