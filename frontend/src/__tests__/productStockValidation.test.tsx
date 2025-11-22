import React from 'react';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ProductManagement from '../pages/ProductManagement';

vi.mock('../api/products', () => ({
  fetchProducts: vi.fn().mockResolvedValue([
    { id: 'p1', name: 'Widget', description: 'A fine widget', price: 9.99, imageUrl: '/images/product1.jpg', stock: 5, createdAt: '', updatedAt: '' },
  ]),
}));

vi.mock('../api/categories', () => ({
  listCategories: vi.fn().mockResolvedValue([]),
}));

vi.mock('../api/productsAdmin', () => ({
  updateProduct: vi.fn(),
  createProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

import { updateProduct } from '../api/productsAdmin';
import { AuthProvider } from '../context/AuthContext';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJleHAiOjQxMDI0NDQ4MDB9.signature';

function withAuth(children: React.ReactNode) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('Product stock validation (non-negative)', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('shoply_admin_token', token);
    vi.clearAllMocks();
  });

  it('prevents saving negative stock and shows error', async () => {
    render(withAuth(<ProductManagement />));
    await waitFor(() => screen.getByRole('table', { name: 'Product list' }));
    // Enter edit mode
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    const stockInput = screen.getByRole('spinbutton', { name: 'Edit stock Widget' });
    fireEvent.change(stockInput, { target: { value: '-1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByText('Stock must be non-negative')).toBeInTheDocument();
    expect(updateProduct).not.toHaveBeenCalled();
  });
});
