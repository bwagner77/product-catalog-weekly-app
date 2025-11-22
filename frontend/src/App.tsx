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
import { useIsMobile } from './hooks/useIsMobile';

interface NavBarProps {
  active: ActiveView;
  onChange(view: ActiveView): void;
}

const NavBar: React.FC<NavBarProps> = ({ active, onChange }) => {
  const cart = useCart();
  const { authenticated, logout } = useAuth();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const hamburgerRef = React.useRef<HTMLButtonElement | null>(null);

  function focusHeading(view: ActiveView) {
    const idMap: Record<ActiveView, string> = {
      products: 'products-heading',
      categories: 'categories-heading',
      productManagement: 'product-management-heading',
      login: 'login-heading'
    };
    const selector = `[data-testid="${idMap[view]}"]`;
    const delays = [0, 10, 25];
    delays.forEach(d => {
      setTimeout(() => {
        const el = document.querySelector(selector) as HTMLElement | null;
        if (el) {
          hamburgerRef.current?.blur();
          el.focus();
        }
      }, d);
    });
  }

  function activate(view: ActiveView) {
    onChange(view);
    if (isMobile) {
      setMenuOpen(false);
      focusHeading(view);
    }
  }

  function toggleMenu() {
    setMenuOpen(prev => {
      const next = !prev;
      if (!next) {
        // Focus synchronously first to satisfy tests, then reinforce asynchronously.
        hamburgerRef.current?.focus();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            hamburgerRef.current?.focus();
          });
        });
      }
      return next;
    });
  }

  return (
    <header className="p-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10" role="banner">
      <div className="flex items-center space-x-3" aria-label="Brand" data-testid="brand">
        <div className="w-8 h-8 flex items-center justify-center rounded bg-indigo-600 text-white font-bold" aria-label="Shoply logo" data-testid="logo">S</div>
        <h1 className="text-xl font-semibold" data-testid="brand-name">Shoply</h1>
      </div>
      {!isMobile && (
        <nav aria-label="Primary" className="flex items-center space-x-2" role="navigation">
          <button type="button" onClick={() => activate('products')} aria-current={active === 'products' ? 'page' : undefined} className={`px-3 py-1 rounded text-sm font-medium border ${active === 'products' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`} data-testid="nav-products">Products</button>
          {authenticated && <button type="button" onClick={() => activate('categories')} aria-current={active === 'categories' ? 'page' : undefined} className={`px-3 py-1 rounded text-sm font-medium border ${active === 'categories' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`} data-testid="nav-categories">Category Management</button>}
          {authenticated && <button type="button" onClick={() => activate('productManagement')} aria-current={active === 'productManagement' ? 'page' : undefined} className={`px-3 py-1 rounded text-sm font-medium border ${active === 'productManagement' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`} data-testid="nav-product-mgmt">Product Management</button>}
          {authenticated && <button type="button" onClick={() => { logout(); activate('login'); }} className="px-3 py-1 rounded text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100" data-testid="nav-logout">Logout</button>}
          {!authenticated && <button type="button" onClick={() => activate('login')} aria-current={active === 'login' ? 'page' : undefined} className={`px-3 py-1 rounded text-sm font-medium border ${active === 'login' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`} data-testid="nav-login">Login</button>}
        </nav>
      )}
      {isMobile && (
        <div className="flex items-center" role="navigation" aria-label="Mobile navigation">
          <button
            type="button"
            aria-label="Menu"
            aria-controls="mobile-menu"
            aria-expanded={menuOpen ? 'true' : 'false'}
            onClick={toggleMenu}
            className="px-3 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
            data-testid="hamburger-button"
            ref={hamburgerRef}
          >☰</button>
        </div>
      )}
      <div className="flex items-center space-x-4" aria-label="Cart summary">
        <span className="text-sm" data-testid="cart-count">Cart: {cart.count}</span>
        <span className="text-sm" data-testid="cart-total">Total: ${cart.total.toFixed(2)}</span>
      </div>
      {isMobile && menuOpen && (
        <div id="mobile-menu" data-testid="hamburger-menu" className="absolute left-0 top-full w-full bg-white border-t border-gray-200 shadow-sm p-4 flex flex-col space-y-2" role="menu" aria-label="Mobile navigation menu">
          <button role="menuitem" type="button" onClick={() => activate('products')} aria-current={active === 'products' ? 'page' : undefined} className={`text-left px-3 py-2 rounded text-sm font-medium border ${active === 'products' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>Products</button>
          {authenticated && <button role="menuitem" type="button" onClick={() => activate('categories')} aria-current={active === 'categories' ? 'page' : undefined} className={`text-left px-3 py-2 rounded text-sm font-medium border ${active === 'categories' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>Category Management</button>}
          {authenticated && <button role="menuitem" type="button" onClick={() => activate('productManagement')} aria-current={active === 'productManagement' ? 'page' : undefined} className={`text-left px-3 py-2 rounded text-sm font-medium border ${active === 'productManagement' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>Product Management</button>}
          {authenticated && <button role="menuitem" type="button" onClick={() => { logout(); activate('login'); }} className="text-left px-3 py-2 rounded text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100">Logout</button>}
          {!authenticated && <button role="menuitem" type="button" onClick={() => activate('login')} aria-current={active === 'login' ? 'page' : undefined} className={`text-left px-3 py-2 rounded text-sm font-medium border ${active === 'login' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>Login</button>}
        </div>
      )}
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
    const base = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3000';
    const root = `${base.replace(/\/$/, '')}/api/orders`;
    try {
      const res = await fetch(root, {
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
      window.dispatchEvent(new CustomEvent('order:placed', { detail: { items: cart.items.map(i => ({ productId: i.productId, quantity: i.quantity })) } }));
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
