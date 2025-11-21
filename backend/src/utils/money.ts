// Centralized currency rounding helper (T122)
// Ensures single rounding step using half-up semantics to two decimals.
export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export default roundCurrency;