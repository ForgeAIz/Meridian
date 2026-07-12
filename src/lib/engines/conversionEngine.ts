// ─── Conversion Engine ───────────────────────────────────────────────────────
// Pure functions for multi-currency conversion and live draft total recalculation.
// All functions are stateless — they take data in, return results out.
// Unit-testable independently of any UI or data layer.

import type { FxRates, Currency, Snapshot, Entry, AssetEntry, LiabilityEntry } from "../types";

/**
 * Converts a single entry's value from its native currency to the base currency.
 *
 * If the entry's currency matches the base currency, the value passes through
 * unchanged (rate = 1, avoiding floating-point artifacts from unnecessary math).
 *
 * @param value - The entry's value in its native currency
 * @param entryCurrency - The entry's native currency
 * @param fxRates - Current FX rate map (baseCurrency -> rate)
 * @param baseCurrency - The target base currency
 * @returns The value converted to the base currency
 */
export function computeBaseValue(
  value: number,
  entryCurrency: Currency,
  fxRates: FxRates,
  baseCurrency: Currency
): number {
  if (entryCurrency === baseCurrency) {
    return value;
  }

  const rate = fxRates[entryCurrency];

  // If we somehow don't have a rate for this currency, return 0
  // (the caller should have validated this; this is a defensive fallback)
  if (rate === undefined || rate === null) {
    return 0;
  }

  return value * rate;
}

/**
 * Recalculates all derived totals for a DRAFT snapshot given current FX rates.
 *
 * Mutates entries in place and returns the updated snapshot with fresh totals.
 * This is called on every keystroke in the entry form (debounced as appropriate
 * by the UI layer) and once at lock time with frozen rates.
 *
 * @param snapshot - The current DRAFT snapshot to recalculate
 * @param fxRates - Current (or lock-time-frozen) FX rates
 * @param baseCurrency - The user's base currency
 * @returns The same snapshot object with updated totals (mutated in place for performance)
 */
export function recalculateDraftTotals(
  snapshot: Snapshot,
  fxRates: FxRates,
  baseCurrency: Currency
): Snapshot {
  // Recalculate every asset entry
  for (const entry of snapshot.assets) {
    entry.valueInBaseCurrency = computeBaseValue(entry.value, entry.currency, fxRates, baseCurrency);
  }

  // Recalculate every liability entry
  for (const entry of snapshot.liabilities) {
    entry.valueInBaseCurrency = computeBaseValue(entry.value, entry.currency, fxRates, baseCurrency);
  }

  // Sum up totals
  snapshot.totalAssets = snapshot.assets.reduce((sum, e) => sum + e.valueInBaseCurrency, 0);
  snapshot.totalLiabilities = snapshot.liabilities.reduce((sum, e) => sum + e.valueInBaseCurrency, 0);
  snapshot.netWorth = snapshot.totalAssets - snapshot.totalLiabilities;

  return snapshot;
}

/**
 * Creates a fresh, empty DRAFT snapshot for a user's first month.
 *
 * @param userId - The user's ID
 * @param month - The month string (e.g. "2026-03")
 * @param baseCurrency - The user's base currency
 * @returns A new DRAFT snapshot with no entries
 */
export function createEmptySnapshot(
  userId: string,
  month: string,
  baseCurrency: Currency
): Snapshot {
  return {
    id: crypto.randomUUID?.() ?? `${userId}-${month}-${Date.now()}`,
    userId,
    month,
    status: "draft",
    baseCurrency,
    fxRatesUsed: null,
    assets: [],
    liabilities: [],
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0,
    lockedAt: null,
  };
}

/**
 * Validates that an FX rate is available for a given currency.
 *
 * @param currency - The currency to check
 * @param fxRates - The current FX rate map
 * @returns true if a rate exists and is a positive number
 */
export function hasFxRate(currency: Currency, fxRates: FxRates): boolean {
  const rate = fxRates[currency];
  return rate !== undefined && rate !== null && rate > 0 && isFinite(rate);
}
