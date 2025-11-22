import { describe, it, expect } from 'vitest';
import { NAV_ITEMS_ORDER } from '../constants/navigation';

describe('navigation constants', () => {
  it('defines expected navigation order and uniqueness', () => {
    expect(NAV_ITEMS_ORDER).toEqual([
      'products',
      'categories',
      'productManagement',
      'logout'
    ]);
    // Ensure no duplicates
    const set = new Set(NAV_ITEMS_ORDER);
    expect(set.size).toBe(NAV_ITEMS_ORDER.length);
  });
});
