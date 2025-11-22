import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

function seedAdminToken() {
  const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1h
  const payload = btoa(JSON.stringify({ role: 'admin', exp: futureExp }));
  localStorage.setItem('shoply_admin_token', `x.${payload}.y`);
}

describe('Navigation order and aria-current (T163)', () => {
  beforeEach(() => {
    localStorage.clear();
    seedAdminToken();
  });

  it('renders buttons in required order for admin and maintains single aria-current across route changes', async () => {
    render(<App />);
    const nav = screen.getByRole('navigation', { name: /primary/i });
    // Collect buttons in DOM order
    const buttons = Array.from(nav.querySelectorAll('button')) as HTMLButtonElement[];
    const labels = buttons.map(b => b.textContent?.trim());
    expect(labels).toEqual(['Products', 'Category Management', 'Product Management', 'Logout']);

    const productsBtn = screen.getByTestId('nav-products');
    const categoriesBtn = screen.getByTestId('nav-categories');
    const productMgmtBtn = screen.getByTestId('nav-product-mgmt');
    const logoutBtn = screen.getByTestId('nav-logout');

    const user = userEvent.setup();

    // Helper to assert only one aria-current
    const assertSingleAriaCurrent = (expected: HTMLElement) => {
      const currentEls = buttons.filter(b => b.getAttribute('aria-current') === 'page');
      expect(currentEls.length).toBe(1);
      expect(currentEls[0]).toBe(expected);
    };

    // Initial view should be products
    assertSingleAriaCurrent(productsBtn);

    // Switch to Category Management
    await user.click(categoriesBtn);
    assertSingleAriaCurrent(categoriesBtn);

    // Switch to Product Management
    await user.click(productMgmtBtn);
    assertSingleAriaCurrent(productMgmtBtn);

    // Switch back to Products
    await user.click(productsBtn);
    assertSingleAriaCurrent(productsBtn);

    // Logout changes navigation; verify new order and single aria-current for Login
    await user.click(logoutBtn);
    const navAfterLogout = screen.getByRole('navigation', { name: /primary/i });
    const buttonsAfter = Array.from(navAfterLogout.querySelectorAll('button')) as HTMLButtonElement[];
    const labelsAfter = buttonsAfter.map(b => b.textContent?.trim());
    expect(labelsAfter).toEqual(['Products', 'Login']);
    const loginBtn = screen.getByTestId('nav-login');
    const assertSingleAriaCurrentAfter = () => {
      const currentEls = buttonsAfter.filter(b => b.getAttribute('aria-current') === 'page');
      expect(currentEls.length).toBe(1);
      expect(currentEls[0]).toBe(loginBtn);
    };
    assertSingleAriaCurrentAfter();
  });
});
