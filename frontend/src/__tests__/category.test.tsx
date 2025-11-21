import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import CategoryManagement from '../pages/CategoryManagement';

vi.mock('../api/categories', () => ({
  listCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

import { listCategories, createCategory, updateCategory, deleteCategory } from '../api/categories';

const baseCategories = [
  { id: 'c1', name: 'Electronics', createdAt: '', updatedAt: '' },
  { id: 'c2', name: 'Kitchen', createdAt: '', updatedAt: '' },
];

describe('[US4] CategoryManagement page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (listCategories as any).mockResolvedValue([...baseCategories]);
  });

  it('lists existing categories on load', async () => {
    render(<CategoryManagement />);
    await waitFor(() => expect(listCategories).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('table', { name: 'Category list' })).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Kitchen')).toBeInTheDocument();
  });

  it('creates a new category and shows it in the list', async () => {
    (createCategory as any).mockImplementation(async (input: { name: string }) => ({ id: 'c3', name: input.name, createdAt: '', updatedAt: '' }));
    render(<CategoryManagement />);
    await waitFor(() => expect(listCategories).toHaveBeenCalledTimes(1));
    const input = screen.getByPlaceholderText('e.g. Electronics');
    fireEvent.change(input, { target: { value: 'Books' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    await waitFor(() => expect(createCategory).toHaveBeenCalledTimes(1));
    expect(screen.getByText('Books')).toBeInTheDocument();
  });

  it('updates a category name inline and persists change', async () => {
    (updateCategory as any).mockImplementation(async (_id: string, input: { name: string }) => ({ id: 'c1', name: input.name, createdAt: '', updatedAt: '' }));
    render(<CategoryManagement />);
    await waitFor(() => expect(listCategories).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    const editInput = screen.getByLabelText('Edit category Electronics');
    fireEvent.change(editInput, { target: { value: 'Gadgets' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(updateCategory).toHaveBeenCalledTimes(1));
    expect(screen.getByText('Gadgets')).toBeInTheDocument();
  });

  it('shows validation error when attempting empty name on edit', async () => {
    render(<CategoryManagement />);
    await waitFor(() => expect(listCategories).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    const editInput = screen.getByLabelText('Edit category Electronics');
    fireEvent.change(editInput, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByText('Name required')).toBeInTheDocument();
  });

  it('shows backend error message on duplicate name', async () => {
    (updateCategory as any).mockRejectedValue(new Error('Duplicate category name'));
    render(<CategoryManagement />);
    await waitFor(() => expect(listCategories).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    const editInput = screen.getByLabelText('Edit category Electronics');
    fireEvent.change(editInput, { target: { value: 'Kitchen' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(updateCategory).toHaveBeenCalledTimes(1));
    expect(screen.getByText('Duplicate category name')).toBeInTheDocument();
  });

  it('shows conflict message when deletion blocked by referenced products', async () => {
    (deleteCategory as any).mockRejectedValue(new Error('409 Conflict: Category in use'));
    render(<CategoryManagement />);
    await waitFor(() => expect(listCategories).toHaveBeenCalledTimes(1));
    // Delete Electronics (first row)
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    await waitFor(() => expect(deleteCategory).toHaveBeenCalledTimes(1));
    expect(screen.getByText('409 Conflict: Category in use')).toBeInTheDocument();
    // Row still present
    expect(screen.getByText('Electronics')).toBeInTheDocument();
  });
});
