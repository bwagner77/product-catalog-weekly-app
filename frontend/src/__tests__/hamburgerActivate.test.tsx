import { describe, test, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import App from '../App';

// T209: Activation collapses menu & focuses heading (FR-065, SC-047)
describe('Hamburger Navigation - Item Activation', () => {
  test('activating Products collapses menu and focuses page heading', async () => {
    Object.defineProperty(window, 'innerWidth', { value: 600, configurable: true });
    const { getByTestId, findByTestId } = render(<App />);
    const btn = getByTestId('hamburger-button');
    fireEvent.click(btn);
    const menu = getByTestId('hamburger-menu');
    const items = Array.from(menu.querySelectorAll('button'));
    fireEvent.click(items[0]); // Products item inside menu
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    await new Promise(r => setTimeout(r, 30));
    const heading = await findByTestId('products-heading');
    expect(document.activeElement).toBe(heading);
  });
});
