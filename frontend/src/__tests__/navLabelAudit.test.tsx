import { render, screen, within } from '@testing-library/react';
import App from '../App';

// Helper to seed an arbitrary admin JWT (payload only is parsed)
function seedAdminToken() {
  const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1h from now
  const payload = btoa(JSON.stringify({ role: 'admin', exp: futureExp }));
  localStorage.setItem('shoply_admin_token', `x.${payload}.y`);
}

describe('Navigation label audit (T162)', () => {
  beforeEach(() => {
    localStorage.clear();
    seedAdminToken();
  });

  it('replaces legacy label "Categories" with "Category Management" and no legacy label remains in nav', () => {
    render(<App />);
    const nav = screen.getByRole('navigation', { name: /primary/i });
    // Presence of new label
    expect(within(nav).getByText('Category Management')).toBeInTheDocument();
    // Absence of legacy label as a standalone button/text in nav
    expect(within(nav).queryByText(/^Categories$/i)).toBeNull();
  });
});
