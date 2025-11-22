import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import OrderConfirmation from '../components/OrderConfirmation';
import type { Order } from '../types/order';

describe('OrderConfirmation dual dismissal (T136)', () => {
  function sampleOrder(): Order {
    return {
      id: 'o123',
      items: [ { productId: 'p1', name: 'Widget', price: 9.99, quantity: 1 } ],
      total: 9.99,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  it('renders both × icon and Close button with accessible names and both dismiss dialog', async () => {
    const user = userEvent.setup();
    let closed = 0;
    const handleClose = () => { closed++; };
    const { rerender } = render(<OrderConfirmation order={sampleOrder()} onClose={handleClose} />);
    const dialog = screen.getByRole('dialog', { name: /order placed/i });
    const iconBtn = within(dialog).getByRole('button', { name: /close confirmation/i });
    iconBtn.focus();
    expect(document.activeElement).toBe(iconBtn);
    await user.click(iconBtn);
    expect(closed).toBe(1);
    // Simulate dismissal by removing order (dialog unmount)
    rerender(<OrderConfirmation order={null} onClose={handleClose} />);
    expect(screen.queryByRole('dialog', { name: /order placed/i })).toBeNull();
    // Open again
    rerender(<OrderConfirmation order={sampleOrder()} onClose={handleClose} />);
    const dialog2 = screen.getByRole('dialog', { name: /order placed/i });
    const secondaryBtn2 = within(dialog2).getByRole('button', { name: /close order confirmation/i });
    secondaryBtn2.focus();
    expect(document.activeElement).toBe(secondaryBtn2);
    await user.click(secondaryBtn2);
    expect(closed).toBe(2);
  });
});
