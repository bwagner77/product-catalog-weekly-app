import { describe, test, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import App from '../App';

// T210: Rapid toggling stability (FR-066, SC-045, SC-048)
describe('Hamburger Navigation - Rapid Toggle Stability', () => {
  test('rapid toggling does not create duplicate containers or multiple aria-current', () => {
    Object.defineProperty(window, 'innerWidth', { value: 520, configurable: true });
    const { getByTestId } = render(<App />);
    const btn = getByTestId('hamburger-button');
    for (let i = 0; i < 50; i++) {
      fireEvent.click(btn);
    }
    // Expanded state may end either true/false depending on parity
    const menus = document.querySelectorAll('[data-testid="hamburger-menu"]');
    expect(menus.length).toBeLessThanOrEqual(1);
    const ariaCurrents = document.querySelectorAll('[aria-current="page"]');
    expect(ariaCurrents.length).toBeLessThanOrEqual(1);
  });
});
