import { describe, it, expect } from "vitest";
import {
  netWorthSeries,
  leverageRatioSeries,
  categoryAllocation,
  momChange,
  assetsVsLiabilitiesSeries,
  leverageTrendLabel,
} from "../aggregationEngine";
import type { Snapshot } from "../../types";

// ─── Jane's 3-month worked example ───────────────────────────────────────────
// From the full documentation Section 6.
// Base currency: GBP. All entries are in GBP.

const jan2026: Snapshot = {
  id: "s1",
  userId: "jane",
  month: "2026-01",
  status: "locked",
  baseCurrency: "GBP",
  fxRatesUsed: { USD: 1.27, GBP: 1.0, EUR: 1.16, AUD: 1.95, CAD: 1.72 },
  assets: [
    { id: "a1", name: "Cash", category: "Cash", currency: "GBP", value: 15000, valueInBaseCurrency: 15000 },
    { id: "a2", name: "ISA", category: "Investments", currency: "GBP", value: 40000, valueInBaseCurrency: 40000 },
    { id: "a3", name: "Property", category: "Property", currency: "GBP", value: 450000, valueInBaseCurrency: 450000 },
  ],
  liabilities: [
    { id: "l1", name: "Mortgage", category: "Mortgage", currency: "GBP", value: 380000, valueInBaseCurrency: 380000 },
  ],
  totalAssets: 505000,
  totalLiabilities: 380000,
  netWorth: 125000,
  lockedAt: "2026-01-31T23:59:00Z",
};

const feb2026: Snapshot = {
  id: "s2",
  userId: "jane",
  month: "2026-02",
  status: "locked",
  baseCurrency: "GBP",
  fxRatesUsed: { USD: 1.27, GBP: 1.0, EUR: 1.16, AUD: 1.95, CAD: 1.72 },
  assets: [
    { id: "a1", name: "Cash", category: "Cash", currency: "GBP", value: 15800, valueInBaseCurrency: 15800 },
    { id: "a2", name: "ISA", category: "Investments", currency: "GBP", value: 41500, valueInBaseCurrency: 41500 },
    { id: "a3", name: "Property", category: "Property", currency: "GBP", value: 450000, valueInBaseCurrency: 450000 },
  ],
  liabilities: [
    { id: "l1", name: "Mortgage", category: "Mortgage", currency: "GBP", value: 378500, valueInBaseCurrency: 378500 },
  ],
  totalAssets: 507300,
  totalLiabilities: 378500,
  netWorth: 128800,
  lockedAt: "2026-02-28T23:59:00Z",
};

const mar2026: Snapshot = {
  id: "s3",
  userId: "jane",
  month: "2026-03",
  status: "locked",
  baseCurrency: "GBP",
  fxRatesUsed: { USD: 1.27, GBP: 1.0, EUR: 1.16, AUD: 1.95, CAD: 1.72 },
  assets: [
    { id: "a1", name: "Cash", category: "Cash", currency: "GBP", value: 16600, valueInBaseCurrency: 16600 },
    { id: "a2", name: "ISA", category: "Investments", currency: "GBP", value: 40900, valueInBaseCurrency: 40900 },
    { id: "a3", name: "Property", category: "Property", currency: "GBP", value: 450000, valueInBaseCurrency: 450000 },
  ],
  liabilities: [
    { id: "l1", name: "Mortgage", category: "Mortgage", currency: "GBP", value: 377000, valueInBaseCurrency: 377000 },
  ],
  totalAssets: 507500,
  totalLiabilities: 377000,
  netWorth: 130500,
  lockedAt: "2026-03-31T23:59:00Z",
};

const allSnapshots = [jan2026, feb2026, mar2026];

// ─── netWorthSeries ──────────────────────────────────────────────────────────

describe("netWorthSeries", () => {
  it("returns net worth points in chronological order", () => {
    const series = netWorthSeries(allSnapshots);

    expect(series).toHaveLength(3);
    expect(series[0]).toEqual({ month: "2026-01", netWorth: 125000 });
    expect(series[1]).toEqual({ month: "2026-02", netWorth: 128800 });
    expect(series[2]).toEqual({ month: "2026-03", netWorth: 130500 });
  });

  it("filters out DRAFT snapshots", () => {
    const draft: Snapshot = {
      ...jan2026,
      id: "draft",
      month: "2026-04",
      status: "draft",
      netWorth: 99999,
    };
    const series = netWorthSeries([...allSnapshots, draft]);
    expect(series).toHaveLength(3);
  });

  it("returns empty array for no snapshots", () => {
    expect(netWorthSeries([])).toEqual([]);
  });
});

// ─── leverageRatioSeries ─────────────────────────────────────────────────────

describe("leverageRatioSeries", () => {
  it("computes leverage ratios correctly (Jane's data)", () => {
    const series = leverageRatioSeries(allSnapshots);

    expect(series).toHaveLength(3);
    // Jan: 380,000 / 505,000 = 0.7525...
    expect(series[0].ratio).toBeCloseTo(0.7525, 2);
    // Feb: 378,500 / 507,300 = 0.7461...
    expect(series[1].ratio).toBeCloseTo(0.7461, 2);
    // Mar: 377,000 / 507,500 = 0.7429...
    expect(series[2].ratio).toBeCloseTo(0.7429, 2);
  });

  it("excludes months with zero total assets", () => {
    const zeroAssets: Snapshot = {
      ...jan2026,
      id: "zero",
      month: "2026-04",
      totalAssets: 0,
    };
    const series = leverageRatioSeries([jan2026, zeroAssets]);
    expect(series).toHaveLength(1); // Jan only
  });
});

// ─── categoryAllocation ──────────────────────────────────────────────────────

describe("categoryAllocation", () => {
  it("computes asset allocations for Jane's March", () => {
    const allocations = categoryAllocation(mar2026.assets, mar2026.totalAssets);

    // Property: 450,000 / 507,500 = 88.67%
    // Cash: 16,600 / 507,500 = 3.27%
    // Investments: 40,900 / 507,500 = 8.06%

    expect(allocations).toHaveLength(3);
    expect(allocations[0].category).toBe("Property"); // Largest first
    expect(allocations[0].percent).toBeCloseTo(88.67, 1);
    expect(allocations[1].category).toBe("Investments");
    expect(allocations[1].percent).toBeCloseTo(8.06, 1);
    expect(allocations[2].category).toBe("Cash");
    expect(allocations[2].percent).toBeCloseTo(3.27, 1);
  });

  it("returns empty array when total is zero", () => {
    expect(categoryAllocation([], 0)).toEqual([]);
  });

  it("handles a single category", () => {
    const allocations = categoryAllocation(
      [{ id: "a1", name: "Cash", category: "Cash", currency: "GBP", value: 100, valueInBaseCurrency: 100 }],
      100
    );
    expect(allocations).toHaveLength(1);
    expect(allocations[0].percent).toBe(100);
  });
});

// ─── momChange ───────────────────────────────────────────────────────────────

describe("momChange", () => {
  it("returns null for the first month (no prior data)", () => {
    expect(momChange(allSnapshots, "2026-01")).toBeNull();
  });

  it("computes Feb MoM change: +£3,800 (+3.0%)", () => {
    const change = momChange(allSnapshots, "2026-02");
    expect(change).not.toBeNull();
    expect(change!.delta).toBe(3800);
    expect(change!.percent).toBeCloseTo(3.04, 1); // 3800 / 125000 * 100 = 3.04
  });

  it("computes Mar MoM change: +£1,700 (+1.3%)", () => {
    const change = momChange(allSnapshots, "2026-03");
    expect(change).not.toBeNull();
    expect(change!.delta).toBe(1700);
    expect(change!.percent).toBeCloseTo(1.32, 1); // 1700 / 128800 * 100 = 1.32
  });

  it("handles negative net worth correctly", () => {
    const neg2026_01: Snapshot = { ...jan2026, netWorth: -5000, month: "2026-01" };
    const neg2026_02: Snapshot = { ...feb2026, netWorth: -2000, month: "2026-02" };

    const change = momChange([neg2026_01, neg2026_02], "2026-02");
    expect(change).not.toBeNull();
    expect(change!.delta).toBe(3000); // -2000 - (-5000) = 3000
    // Percent = 3000 / abs(-5000) * 100 = 60% (improvement)
    expect(change!.percent).toBeCloseTo(60, 1);
  });

  it("returns null percent when previous net worth is 0", () => {
    const zeroNW: Snapshot = { ...jan2026, netWorth: 0, month: "2026-01" };
    const positiveNW: Snapshot = { ...feb2026, netWorth: 5000, month: "2026-02" };

    const change = momChange([zeroNW, positiveNW], "2026-02");
    expect(change).not.toBeNull();
    expect(change!.delta).toBe(5000);
    expect(change!.percent).toBeNull(); // Can't compute percent from 0
  });
});

// ─── assetsVsLiabilitiesSeries ───────────────────────────────────────────────

describe("assetsVsLiabilitiesSeries", () => {
  it("returns separate series for assets and liabilities", () => {
    const { assets, liabilities } = assetsVsLiabilitiesSeries(allSnapshots);

    expect(assets).toHaveLength(3);
    expect(liabilities).toHaveLength(3);

    expect(assets[2]).toEqual({ month: "2026-03", netWorth: 507500 });
    expect(liabilities[2]).toEqual({ month: "2026-03", netWorth: 377000 });
  });
});

// ─── leverageTrendLabel ──────────────────────────────────────────────────────

describe("leverageTrendLabel", () => {
  it("returns Stable when there are fewer than 3 points", () => {
    expect(leverageTrendLabel([{ month: "2026-01", ratio: 0.75 }]).direction).toBe("Stable");
    expect(
      leverageTrendLabel([
        { month: "2026-01", ratio: 0.75 },
        { month: "2026-02", ratio: 0.74 },
      ]).direction
    ).toBe("Stable");
  });

  it("returns Improving when ratio is falling (Jane's data)", () => {
    const points = leverageRatioSeries(allSnapshots);
    const label = leverageTrendLabel(points);
    expect(label.direction).toBe("Improving");
  });

  it("returns Rising when ratio is increasing", () => {
    const rising = [
      { month: "2026-01", ratio: 0.50 },
      { month: "2026-02", ratio: 0.55 },
      { month: "2026-03", ratio: 0.60 },
    ];
    expect(leverageTrendLabel(rising).direction).toBe("Rising");
  });
});
