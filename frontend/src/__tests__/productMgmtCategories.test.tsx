import React from 'react';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ProductManagement from '../pages/ProductManagement';

vi.mock('../api/products', () => ({
  fetchProducts: vi.fn().mockResolvedValue([]),
}));

vi.mock('../api/categories', () => ({
  listCategories: vi.fn(),
}));

vi.mock('../api/productsAdmin', () => ({
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

import { listCategories } from '../api/categories';
import { AuthProvider } from '../context/AuthContext';

// Far-future admin token (same format as authContext.test)
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJleHAiOjQxMDI0NDQ4MDB9.signature';

function withAuth(children: React.ReactNode) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('ProductManagement category dropdown completeness', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('shoply_admin_token', token);
    (listCategories as any).mockResolvedValue([
      { id: 'c1', name: 'Electronics', createdAt: '', updatedAt: '' },
      { id: 'c2', name: 'Kitchen', createdAt: '', updatedAt: '' },
      { id: 'c3', name: 'Books', createdAt: '', updatedAt: '' },
      { id: 'c4', name: 'Toys', createdAt: '', updatedAt: '' },
      { id: 'c5', name: 'Outdoors', createdAt: '', updatedAt: '' },
    ]);
  });

  it('lists all categories in the create dropdown', async () => {
    render(withAuth(<ProductManagement />));
    await waitFor(() => expect(listCategories).toHaveBeenCalledTimes(1));
    const select = screen.getByLabelText('Category');
    expect(select).toBeInTheDocument();
    const options = Array.from((select as HTMLSelectElement).options).map(o => o.textContent);
    expect(options).toEqual(expect.arrayContaining(['Unassigned','Electronics','Kitchen','Books','Toys','Outdoors']));
  });
});
