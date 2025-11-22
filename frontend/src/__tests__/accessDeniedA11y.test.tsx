import React from 'react';
import { render, screen } from '@testing-library/react';
import AccessDenied from '../components/AccessDenied';

/**
 * T177: AccessDenied a11y semantics test (role=alert, heading association, message clarity).
 */

describe('AccessDenied A11y', () => {
  test('renders with role alert and labelled heading', () => {
    render(<AccessDenied />);
    const container = screen.getByTestId('access-denied');
    expect(container).toHaveAttribute('role', 'alert');
    const heading = screen.getByRole('heading', { name: /access denied/i });
    expect(heading).toBeInTheDocument();
    // Ensure aria-labelledby matches heading id
    expect(container.getAttribute('aria-labelledby')).toBe(heading.id);
    // Message clarity
    expect(screen.getByText(/admin access required/i)).toBeInTheDocument();
  });
});
