import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import CategoryManagement from '../pages/CategoryManagement';

// Mock categories API to control responses
vi.mock('../api/categories', () => ({
  listCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

import { listCategories, createCategory } from '../api/categories';

describe('Expired session UX messaging (token_expired)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (listCategories as any).mockResolvedValue([
      { id: 'c1', name: 'Electronics', createdAt: '', updatedAt: '' },
    ]);
  });

  it('surfaces consistent session expired message on create failure', async () => {
    (createCategory as any).mockRejectedValue(new Error('Session expired – please log in again'));
    render(<CategoryManagement />);
    await waitFor(() => expect(listCategories).toHaveBeenCalledTimes(1));
    const input = screen.getByPlaceholderText('e.g. Electronics');
    fireEvent.change(input, { target: { value: 'Books' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    await waitFor(() => expect(createCategory).toHaveBeenCalledTimes(1));
    expect(screen.getByText(/Session expired/i)).toBeInTheDocument();
  });
});
