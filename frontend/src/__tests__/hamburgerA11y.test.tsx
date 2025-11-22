import { describe, test, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import App from '../App';

// T213: Accessibility semantics (FR-062, SC-050)
describe('Hamburger Navigation - Accessibility Semantics', () => {
  test('hamburger button exposes aria-label, controls, and expanded state changes', () => {
    Object.defineProperty(window, 'innerWidth', { value: 620, configurable: true });
    const { getByTestId } = render(<App />);
    const btn = getByTestId('hamburger-button');
    expect(btn.getAttribute('aria-label') || btn.textContent).toBeTruthy();
    const controls = btn.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });
});
