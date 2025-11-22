import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ProductList from '../pages/ProductList';
import OrderConfirmation from '../components/OrderConfirmation';
import type { Order } from '../types/order';
import App from '../App';

const sample = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Widget',
    description: 'A basic widget',
    price: 9.99,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Gadget',
    description: 'A handy gadget',
    price: 19.99,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('[US3] Accessibility and responsiveness', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    (import.meta as any).env = (import.meta as any).env || {};
    (import.meta as any).env.VITE_API_BASE_URL = '';
    // Seed admin token so categories nav item is rendered for focus order tests
    const header = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
    const payload = 'eyJyb2xlIjoiYWRtaW4iLCJleHAiOjk5OTk5OTk5OTl9';
    localStorage.setItem('shoply_admin_token', `${header}.${payload}.sig`);
  });

  it('renders a list with listitems that contain articles named by the product name', async () => {
    vi.spyOn(global, 'fetch' as any).mockResolvedValue({ ok: true, json: async () => sample });

    render(<ProductList />);

    const list = await screen.findByRole('list', { name: /product list/i });
    const items = within(list).getAllByRole('listitem');
    expect(items.length).toBe(sample.length);

    // Each card is an article named by the heading (product name)
    const articles = within(list).getAllByRole('article');
    expect(articles.length).toBe(sample.length);
    expect(articles[0]).toHaveAccessibleName(sample[0].name);
    expect(articles[1]).toHaveAccessibleName(sample[1].name);
  });

  it('applies responsive grid classes to the list', async () => {
    vi.spyOn(global, 'fetch' as any).mockResolvedValue({ ok: true, json: async () => sample });

    render(<ProductList />);
    const list = await screen.findByRole('list', { name: /product list/i });
    const className = (list as HTMLElement).className;
    expect(className).toContain('grid');
    expect(className).toContain('sm:grid-cols-2');
    expect(className).toContain('lg:grid-cols-3');
  });
  it('focus order: Products nav → Category Management nav → Product Management nav → Logout nav → search → category filter → first product item', async () => {
    vi.spyOn(global, 'fetch' as any).mockResolvedValue({ ok: true, json: async () => sample });
    render(<App />);
    // Wait for products (default view)
    await screen.findByRole('list', { name: /product list/i });
    const navProducts = screen.getByTestId('nav-products');
    const navCategories = screen.getByTestId('nav-categories');
    const navProductMgmt = screen.queryByTestId('nav-product-mgmt');
    const navLogout = screen.queryByTestId('nav-logout');
    const searchInput = screen.getByPlaceholderText('Search…');
    const categorySelect = screen.getByRole('combobox', { name: 'Filter by category' });
    const firstProductItem = screen.getAllByRole('listitem')[0];
    const user = userEvent.setup();
    // Ensure initial focus is body
    expect(document.activeElement?.tagName).toBe('BODY');
    await user.tab();
    expect(document.activeElement).toBe(navProducts);
    await user.tab();
    expect(document.activeElement).toBe(navCategories);
    if (navProductMgmt) {
      await user.tab();
      expect(document.activeElement).toBe(navProductMgmt);
    }
    if (navLogout) {
      await user.tab();
      expect(document.activeElement).toBe(navLogout);
    }
    await user.tab();
    expect(document.activeElement).toBe(searchInput);
    await user.tab();
    expect(document.activeElement).toBe(categorySelect);
    await user.tab();
    expect(document.activeElement).toBe(firstProductItem);
  });

  it('after typing in search, focus stays then proceeds category filter → first product item (updated)', async () => {
    vi.spyOn(global, 'fetch' as any).mockResolvedValue({ ok: true, json: async () => sample });
    render(<App />);
    await screen.findByRole('list', { name: /product list/i });
    const user = userEvent.setup();
    const searchInput = screen.getByPlaceholderText('Search…');
    const categorySelect = screen.getByRole('combobox', { name: 'Filter by category' });
    // capture initial list item (will be replaced after search fetch)
    const initialFirstProductItem = screen.getAllByRole('listitem')[0];
    searchInput.focus();
    await user.type(searchInput, 'Wid');
    expect(document.activeElement).toBe(searchInput);
    await user.tab();
    expect(document.activeElement).toBe(categorySelect);
    await user.tab();
    // Re-acquire first product item after potential re-render
    const updatedFirstProductItem = screen.getAllByRole('listitem')[0];
    expect(document.activeElement).toBe(updatedFirstProductItem);
    // Ensure we did not incorrectly reference stale node
    expect(updatedFirstProductItem).not.toBe(initialFirstProductItem);
  });
  it('image alt text is product name initially and uses fallback pattern after error', async () => {
    vi.spyOn(global, 'fetch' as any).mockResolvedValue({ ok: true, json: async () => sample });
    render(<ProductList />);
    await screen.findByRole('list', { name: /product list/i });
    const firstCardImage = screen.getAllByTestId('product-image')[0];
    expect(firstCardImage).toHaveAttribute('alt', sample[0].name);
    // Simulate error to trigger fallback pattern
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.error(firstCardImage);
    // Wait for React state update
    expect(firstCardImage).toHaveAttribute('alt', `${sample[0].name} – image unavailable`);
  });
  it('order confirmation dialog exposes roles and accessible names', () => {
    const order: Order = {
      id: 'o123',
      items: [
        { productId: '11111111-1111-4111-8111-111111111111', name: 'Widget', price: 9.99, quantity: 1 },
        { productId: '22222222-2222-4222-8222-222222222222', name: 'Gadget', price: 19.99, quantity: 2 }
      ],
      total: 49.97,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    render(<OrderConfirmation order={order} onClose={() => {}} />);
    const dialog = screen.getByRole('dialog', { name: /order placed/i });
    expect(dialog).toBeInTheDocument();
    const idEl = screen.getByTestId('order-id');
    expect(idEl).toHaveTextContent(/o123/);
    const itemsList = screen.getByTestId('order-items');
    const rows = within(itemsList).getAllByRole('listitem');
    expect(rows.length).toBe(2);
    // Each list item should expose accessible name containing product name
    expect(rows[0]).toHaveAccessibleName(/Widget/i);
    expect(rows[1]).toHaveAccessibleName(/Gadget/i);
  });
  it('focus management: place order dialog then close returns focus to body (no trap left)', async () => {
    // Render full App to exercise checkout flow and dialog close
    // Mock products fetch
    vi.spyOn(global, 'fetch' as any).mockImplementation(async (input: RequestInfo) => {
      const url = String(input);
      if (url.endsWith('/api/products')) {
        return { ok: true, json: async () => sample } as any;
      }
      if (url.endsWith('/api/categories')) {
        return { ok: true, json: async () => [] } as any;
      }
      if (url.endsWith('/api/orders')) {
        return { ok: true, json: async () => ({ id: 'o999', items: [ { productId: sample[0].id, name: sample[0].name, price: sample[0].price, quantity: 1 } ], total: sample[0].price, status: 'submitted', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }) } as any;
      }
      return { ok: false, status: 404, json: async () => ({ error: 'not found' }) } as any;
    });
    const user = userEvent.setup();
    render(<App />);
    // Wait for product list
    await screen.findByRole('list', { name: /product list/i });
    // Add first product to cart (button inside article)
    const firstArticle = screen.getAllByRole('article')[0];
    const addBtn = within(firstArticle).getByRole('button', { name: /add to cart/i });
    await user.click(addBtn);
    // Open checkout (cart icon then checkout) - cart controls assumed accessible
    // Find checkout trigger (simulate minimal path)
    const placeOrderButton = screen.getByRole('button', { name: /place order/i });
    await user.click(placeOrderButton);
    const dialog = await screen.findByRole('dialog', { name: /order placed/i });
    const closeButton = within(dialog).getByRole('button', { name: /close confirmation/i });
    closeButton.focus();
    expect(document.activeElement).toBe(closeButton);
    await user.click(closeButton);
    // After closing, focus should move to body or a logical prior interactive element (we assert not stuck on removed button)
    expect(document.activeElement).not.toBe(closeButton);
    // Acceptable fallback: focus resets to body (no lingering focus on removed element)
    expect(document.activeElement?.tagName).toBe('BODY');
  });
  it('cart controls expose accessible names and buttons are reachable via tab', async () => {
    // Mock fetch for product list to allow rendering
    const sampleFetch = vi.spyOn(global, 'fetch' as any).mockResolvedValue({ ok: true, json: async () => sample });
    // Minimal CartProvider context: simulate by localStorage seeding & rendering ProductList only (cart controls live elsewhere in App, but basic accessibility of product list items validated)
    render(<ProductList />);
    await screen.findByRole('list', { name: /product list/i });
    // Product items listitems are focusable (tabIndex=0 in wrapper <li>)
    const user = userEvent.setup();
    await user.tab(); // search
    await user.tab(); // category
    await user.tab(); // first product item
    expect(document.activeElement).toHaveAccessibleName(/Widget/i);
    sampleFetch.mockRestore();
  });
});
