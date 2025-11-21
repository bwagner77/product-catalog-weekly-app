import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ProductList from '../pages/ProductList';

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
  it('focus order: tab sequence reaches search, category filter, then first product item', async () => {
    vi.spyOn(global, 'fetch' as any).mockResolvedValue({ ok: true, json: async () => sample });
    render(<ProductList />);
    // Wait for products
    await screen.findByRole('list', { name: /product list/i });
    const searchInput = screen.getByPlaceholderText('Search…');
    const categorySelect = screen.getByRole('combobox', { name: 'Filter by category' });
    const firstProductItem = screen.getAllByRole('listitem')[0];

    const user = userEvent.setup();
    // Ensure initial focus is body
    expect(document.activeElement?.tagName).toBe('BODY');
    await user.tab();
    expect(document.activeElement).toBe(searchInput);
    await user.tab();
    expect(document.activeElement).toBe(categorySelect);
    await user.tab();
    expect(document.activeElement).toBe(firstProductItem);
  });

  it('after typing in search, focus stays on input; tab moves to category then (updated) first product item', async () => {
    vi.spyOn(global, 'fetch' as any).mockResolvedValue({ ok: true, json: async () => sample });
    render(<ProductList />);
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
});
