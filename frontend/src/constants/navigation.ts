export const NAV_ITEMS_ORDER = [
  'products',
  'categories',
  'productManagement',
  'logout'
] as const;

export type NavItemKey = typeof NAV_ITEMS_ORDER[number];
