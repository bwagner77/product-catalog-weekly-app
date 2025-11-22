import { describe, test, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import App from '../App';

// T211: Non-admin gating omission (FR-063, SC-046)
describe('Hamburger Navigation - Gating', () => {
  test('non-admin sees no admin-only items after expansion', () => {
    Object.defineProperty(window, 'innerWidth', { value: 599, configurable: true });
    const { getByTestId, queryByText } = render(<App />); // unauthenticated by default
    const btn = getByTestId('hamburger-button');
    fireEvent.click(btn);
    expect(queryByText(/product management/i)).toBeNull();
    expect(queryByText(/category management/i)).toBeNull();
  });
});
