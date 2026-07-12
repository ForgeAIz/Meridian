import { describe, it, expect } from "vitest";
import {
  computeBaseValue,
  recalculateDraftTotals,
  createEmptySnapshot,
  hasFxRate,
} from "../conversionEngine";
import type { FxRates, Currency, Snapshot } from "../../types";

// ─── Shared test FX rates (GBP = base) ───────────────────────────────────────

const gbpRates: FxRates = {
  USD: 1.27,
  GBP: 1.0,
  EUR: 1.16,
  AUD: 1.95,
  CAD: 1.72,
};

// ─── computeBaseValue ────────────────────────────────────────────────────────

describe("computeBaseValue", () => {
  it("returns the same value when entry currency matches base currency", () => {
    const result = computeBaseValue(15000, "GBP", gbpRates, "GBP");
    expect(result).toBe(15000);
  });

  it("converts USD to GBP correctly", () => {
    const result = computeBaseValue(100, "USD", gbpRates, "GBP");
    expect(result).toBeCloseTo(127, 2); // 100 * 1.27
  });

  it("converts EUR to GBP correctly", () => {
    const result = computeBaseValue(200, "EUR", gbpRates, "GBP");
    expect(result).toBeCloseTo(232, 2); // 200 * 1.16
  });

  it("returns 0 for an unknown currency", () => {
    const result = computeBaseValue(100, "EUR", { USD: 1.0, GBP: 0.79 } as FxRates, "GBP");
    expect(result).toBe(0);
  });

  it("handles zero value correctly", () => {
    const result = computeBaseValue(0, "USD", gbpRates, "GBP");
    expect(result).toBe(0);
  });
});

// ─── recalculateDraftTotals ──────────────────────────────────────────────────

describe("recalculateDraftTotals", () => {
  it("correctly sums single-currency entries (Jane's Jan 2026)", () => {
    const snapshot = createEmptySnapshot("user-1", "2026-01", "GBP");
    snapshot.assets = [
      { id: "a1", name: "Cash", category: "Cash", currency: "GBP", value: 15000, valueInBaseCurrency: 0 },
      { id: "a2", name: "ISA", category: "Investments", currency: "GBP", value: 40000, valueInBaseCurrency: 0 },
      { id: "a3", name: "Property", category: "Property", currency: "GBP", value: 450000, valueInBaseCurrency: 0 },
    ];
    snapshot.liabilities = [
      { id: "l1", name: "Mortgage", category: "Mortgage", currency: "GBP", value: 380000, valueInBaseCurrency: 0 },
    ];

    recalculateDraftTotals(snapshot, gbpRates, "GBP");

    expect(snapshot.totalAssets).toBe(505000);
    expect(snapshot.totalLiabilities).toBe(380000);
    expect(snapshot.netWorth).toBe(125000);
  });

  it("correctly sums multi-currency entries", () => {
    const snapshot = createEmptySnapshot("user-1", "2026-03", "GBP");
    snapshot.assets = [
      { id: "a1", name: "US Stock", category: "Investments", currency: "USD", value: 10000, valueInBaseCurrency: 0 },
      { id: "a2", name: "Euro Account", category: "Cash", currency: "EUR", value: 5000, valueInBaseCurrency: 0 },
    ];
    snapshot.liabilities = [];

    recalculateDraftTotals(snapshot, gbpRates, "GBP");

    // USD 10,000 * 1.27 = 12,700
    // EUR 5,000 * 1.16 = 5,800
    // Total = 18,500
    expect(snapshot.totalAssets).toBeCloseTo(18500, 1);
    expect(snapshot.totalLiabilities).toBe(0);
    expect(snapshot.netWorth).toBeCloseTo(18500, 1);
  });

  it("handles empty asset/liability arrays", () => {
    const snapshot = createEmptySnapshot("user-1", "2026-01", "GBP");
    recalculateDraftTotals(snapshot, gbpRates, "GBP");

    expect(snapshot.totalAssets).toBe(0);
    expect(snapshot.totalLiabilities).toBe(0);
    expect(snapshot.netWorth).toBe(0);
  });
});

// ─── createEmptySnapshot ─────────────────────────────────────────────────────

describe("createEmptySnapshot", () => {
  it("creates a DRAFT snapshot with no entries", () => {
    const snap = createEmptySnapshot("user-1", "2026-01", "GBP");

    expect(snap.userId).toBe("user-1");
    expect(snap.month).toBe("2026-01");
    expect(snap.status).toBe("draft");
    expect(snap.baseCurrency).toBe("GBP");
    expect(snap.assets).toEqual([]);
    expect(snap.liabilities).toEqual([]);
    expect(snap.totalAssets).toBe(0);
    expect(snap.totalLiabilities).toBe(0);
    expect(snap.netWorth).toBe(0);
    expect(snap.fxRatesUsed).toBeNull();
    expect(snap.lockedAt).toBeNull();
  });
});

// ─── hasFxRate ───────────────────────────────────────────────────────────────

describe("hasFxRate", () => {
  it("returns true for a supported currency", () => {
    expect(hasFxRate("USD", gbpRates)).toBe(true);
  });

  it("returns false for a missing currency", () => {
    const incomplete: FxRates = { USD: 1.0, GBP: 1.0, EUR: 0.92, AUD: 1.52, CAD: 1.36 };
    expect(hasFxRate("JPY" as Currency, incomplete)).toBe(false);
  });

  it("returns false for a zero rate", () => {
    const zeroRate: FxRates = { USD: 1.0, GBP: 1.0, EUR: 0, AUD: 1.52, CAD: 1.36 };
    expect(hasFxRate("EUR", zeroRate)).toBe(false);
  });
});
