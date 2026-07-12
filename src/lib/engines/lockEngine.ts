// ─── Lock & Prefill Engine ───────────────────────────────────────────────────
// Pure functions for snapshot lifecycle transitions (EMPTY → DRAFT → LOCKED).
// These operate on the state machine from the system mechanics doc Section 2.

import type {
  Snapshot,
  Currency,
  FxRates,
} from "../types";
import { recalculateDraftTotals, createEmptySnapshot } from "./conversionEngine";

/**
 * Prefills a new month's DRAFT snapshot using the prior locked month's entries
 * as a starting template.
 *
 * Mechanical intent (from the docs): the user should never face a blank form
 * after month one. They're editing deltas, not re-entering their entire
 * financial life every 30 days.
 *
 * Values are **carried forward** from the prior month, not re-derived —
 * the user overwrites what changed.
 *
 * @param userId - The user's ID
 * @param month - The new month (e.g. "2026-04")
 * @param priorSnapshot - The most recent locked snapshot (null for first-ever month)
 * @param baseCurrency - The user's base currency
 * @returns A new DRAFT snapshot, either empty (first month) or pre-filled
 */
export function prefillSnapshot(
  userId: string,
  month: string,
  priorSnapshot: Snapshot | null,
  baseCurrency: Currency
): Snapshot {
  if (priorSnapshot === null) {
    // First-ever month — return an empty DRAFT
    return createEmptySnapshot(userId, month, baseCurrency);
  }

  const newSnapshot = createEmptySnapshot(userId, month, baseCurrency);

  // Copy asset rows from prior month (values carried forward, NOT re-converted)
  for (const entry of priorSnapshot.assets) {
    newSnapshot.assets.push({
      ...entry,
      id: crypto.randomUUID?.() ?? `${userId}-${month}-asset-${Date.now()}-${Math.random()}`,
    });
  }

  // Copy liability rows from prior month
  for (const entry of priorSnapshot.liabilities) {
    newSnapshot.liabilities.push({
      ...entry,
      id: crypto.randomUUID?.() ?? `${userId}-${month}-liability-${Date.now()}-${Math.random()}`,
    });
  }

  // Note: values are carried forward in their original currency.
  // The UI layer will call recalculateDraftTotals with fresh live rates
  // so the user sees accurate base-currency totals immediately.

  return newSnapshot;
}

/**
 * Locks a DRAFT snapshot: freezes FX rates, recalculates final totals,
 * stamps the lock time, and returns the immutable snapshot.
 *
 * Mechanical intent (from the docs): this is the one-way door that converts
 * a live, wobbling number into a fixed historical fact. It's the same
 * mechanism a bank statement uses — a snapshot in time, not a running balance.
 *
 * @param snapshot - The DRAFT snapshot to lock
 * @param fxRates - Freshly fetched FX rates to freeze into the snapshot
 * @returns The locked snapshot (same object, mutated in place)
 */
export function lockSnapshot(snapshot: Snapshot, fxRates: FxRates): Snapshot {
  // Recalculate all totals using the frozen rates
  recalculateDraftTotals(snapshot, fxRates, snapshot.baseCurrency);

  // Store the rates permanently
  snapshot.fxRatesUsed = { ...fxRates };
  snapshot.status = "locked";
  snapshot.lockedAt = new Date().toISOString();

  return snapshot;
}

/**
 * Unlocks a locked snapshot so it can be edited again.
 *
 * Requires explicit user confirmation in the UI layer (not handled here).
 * After unlocking and re-editing, the caller must re-lock with fresh rates.
 *
 * @param snapshot - The locked snapshot to unlock
 * @returns The same snapshot, now in DRAFT status
 */
export function unlockSnapshot(snapshot: Snapshot): Snapshot {
  snapshot.status = "draft";
  snapshot.fxRatesUsed = null;
  snapshot.lockedAt = null;
  return snapshot;
}
