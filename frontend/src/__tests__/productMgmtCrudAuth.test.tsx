import React from 'react';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import ProductManagement from '../pages/ProductManagement';
import { AuthProvider } from '../context/AuthContext';

vi.mock('../api/products', () => ({
  fetchProducts: vi.fn(),
}));

vi.mock('../api/categories', () => ({
  listCategories: vi.fn(),
}));

vi.mock('../api/productsAdmin', () => ({
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

import { fetchProducts } from '../api/products';
import { listCategories } from '../api/categories';
import { createProduct, updateProduct, deleteProduct } from '../api/productsAdmin';

// Far-future admin token
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJleHAiOjQxMDI0NDQ4MDB9.signature';

function withAuth(children: React.ReactNode) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('ProductManagement CRUD – admin success and anonymous blocked', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    (listCategories as any).mockResolvedValue([
      { id: 'c1', name: 'Electronics', createdAt: '', updatedAt: '' },
    ]);
  });

  it('anonymous sees AccessDenied (no create/update/delete actions)', () => {
    (fetchProducts as any).mockResolvedValue([]);
    render(withAuth(<ProductManagement />));
    expect(screen.getByTestId('access-denied')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create/i })).toBeNull();
  });

  it('admin can create, update, and delete products', async () => {
    localStorage.setItem('shoply_admin_token', token);

    (fetchProducts as any).mockResolvedValue([
      { id: 'p1', name: 'P1', description: 'D1', price: 1, stock: 1, imageUrl: 'http://ex/a.jpg', createdAt: '', updatedAt: '' },
    ]);

    (createProduct as any).mockImplementation(async (input: any) => ({
      id: 'p2', name: input.name, description: input.description, price: input.price, stock: input.stock,
      imageUrl: input.imageUrl, createdAt: '', updatedAt: ''
    }));
    (updateProduct as any).mockImplementation(async (_id: string, patch: any) => ({
      id: 'p1', name: 'P1', description: 'D1', price: patch.price ?? 1, stock: patch.stock ?? 1,
      imageUrl: 'http://ex/a.jpg', createdAt: '', updatedAt: ''
    }));
    (deleteProduct as any).mockResolvedValue(undefined);

    render(withAuth(<ProductManagement />));

    // Wait initial load
    await waitFor(() => expect(fetchProducts).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(listCategories).toHaveBeenCalledTimes(1));

    // Create flow
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'NewProd' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'NewDesc' } });
    fireEvent.change(screen.getByLabelText(/image url/i), { target: { value: 'http://ex/new.jpg' } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/stock/i), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));
    await waitFor(() => expect(createProduct).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'NewProd', description: 'NewDesc', imageUrl: 'http://ex/new.jpg', price: 2, stock: 3 })
    ));

    // Update flow for existing p1 (click the first Edit button which corresponds to P1)
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);
    const priceInput = screen.getByLabelText(/edit price p1/i) as HTMLInputElement;
    fireEvent.change(priceInput, { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(updateProduct).toHaveBeenCalledWith('p1', expect.objectContaining({ price: 5 })));

    // Delete flow for p1 (scope to P1 row to avoid ambiguity)
    const p1Cell = screen.getByText('P1');
    const p1Row = p1Cell.closest('tr') as HTMLElement;
    const deleteBtn = within(p1Row).getByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);
    await waitFor(() => expect(deleteProduct).toHaveBeenCalledWith('p1'));
  });
});
