import { describe, test, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import App from '../App';

// T208: Collapse hides items & returns focus (FR-064, SC-045)
describe('Hamburger Navigation - Collapse Focus', () => {
  test('collapse hides items from tab order and returns focus', () => {
    Object.defineProperty(window, 'innerWidth', { value: 640, configurable: true });
    const { getByTestId } = render(<App />);
    const btn = getByTestId('hamburger-button');
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(btn); // collapse
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    // Navigation items are gone post-collapse (menu absent)
    expect(document.querySelector('[data-testid="hamburger-menu"]')).toBeNull();
    expect(document.activeElement).toBe(btn); // focus returned
  });
});
