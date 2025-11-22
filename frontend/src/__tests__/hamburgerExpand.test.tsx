import { describe, test, expect } from 'vitest';
import { render, fireEvent, within } from '@testing-library/react';
import App from '../App';

// T207: Expand shows ordered items with single aria-current and semantics (FR-062, FR-063, SC-044)
describe('Hamburger Navigation - Expansion', () => {
  test('expanding reveals ordered menu items with single aria-current', () => {
    Object.defineProperty(window, 'innerWidth', { value: 600, configurable: true });
    const { getByTestId } = render(<App />);
    const btn = getByTestId('hamburger-button');
    fireEvent.click(btn);
    const menu = getByTestId('hamburger-menu');
    // Buttons now use role=menuitem for improved semantics
    const menuButtons = within(menu).getAllByRole('menuitem');
    expect(menuButtons[0].textContent?.toLowerCase()).toContain('products');
    const current = menuButtons.filter(el => el.getAttribute('aria-current') === 'page');
    expect(current.length).toBe(1);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });
});
