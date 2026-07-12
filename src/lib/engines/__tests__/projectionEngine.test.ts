import { describe, it, expect } from "vitest";
import { projectGoal, addMonths } from "../projectionEngine";
import type { Snapshot, Goal } from "../../types";

// ─── Reuse Jane's 3 snapshots from the worked example ────────────────────────

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
  notes: "",
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
  notes: "",
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
  notes: "",
};

// Extend with extra months to test trailing window
const apr2026: Snapshot = {
  ...mar2026,
  id: "s4",
  month: "2026-04",
  totalAssets: 515000,
  totalLiabilities: 376000,
  netWorth: 139000,
  lockedAt: "2026-04-30T23:59:00Z",
};

const may2026: Snapshot = {
  ...mar2026,
  id: "s5",
  month: "2026-05",
  totalAssets: 522000,
  totalLiabilities: 374500,
  netWorth: 147500,
  lockedAt: "2026-05-31T23:59:00Z",
};

const jun2026: Snapshot = {
  ...mar2026,
  id: "s6",
  month: "2026-06",
  totalAssets: 530000,
  totalLiabilities: 373000,
  netWorth: 157000,
  lockedAt: "2026-06-30T23:59:00Z",
};

const allSnapshots = [jan2026, feb2026, mar2026, apr2026, may2026, jun2026];

// ─── addMonths ───────────────────────────────────────────────────────────────

describe("addMonths", () => {
  it("adds months within the same year", () => {
    expect(addMonths("2026-01", 3)).toBe("2026-04");
  });

  it("rolls over to the next year", () => {
    expect(addMonths("2026-10", 5)).toBe("2027-03");
  });

  it("handles zero months", () => {
    expect(addMonths("2026-03", 0)).toBe("2026-03");
  });
});

// ─── projectGoal ─────────────────────────────────────────────────────────────

describe("projectGoal", () => {
  const retireGoal: Goal = {
    id: "g1",
    userId: "jane",
    label: "Retire by 55",
    targetNetWorth: 500000,
    targetDate: "2034-11",
    currency: "GBP",
    category: "Retirement",
    priority: 1,
    createdAt: "2026-03-01T00:00:00Z",
  };

  it("returns INSUFFICIENT_DATA when fewer than 2 snapshots exist", () => {
    const projection = projectGoal([jan2026], retireGoal);
    expect(projection.status).toBe("INSUFFICIENT_DATA");
    expect(projection.projectedDate).toBeNull();
    expect(projection.progressPercent).toBeCloseTo(25, 1); // 125,000 / 500,000 * 100
  });

  it("returns ACHIEVED when goal is already met", () => {
    const achievedGoal = { ...retireGoal, targetNetWorth: 100000 };
    const projection = projectGoal([jan2026, feb2026], achievedGoal);
    expect(projection.status).toBe("ACHIEVED");
    expect(projection.monthsNeeded).toBe(0);
  });

  it("returns ON_TRACK for a reasonable goal with positive growth", () => {
    // Jane's growth trajectory:
    // Jan→Feb: +3,800
    // Feb→Mar: +1,700
    // Mar→Apr: +8,500
    // Apr→May: +8,500
    // May→Jun: +9,500
    // Trailing 6-month avg (5 deltas): (3800 + 1700 + 8500 + 8500 + 9500) / 5 = 6400
    // Remaining: 500,000 - 157,000 = 343,000
    // Months needed: ceil(343,000 / 6,400) = ceil(53.59) = 54
    // Projected: 2026-06 + 54 months = 2030-12
    // Target: 2034-11 => ON_TRACK
    const projection = projectGoal(allSnapshots, retireGoal);
    expect(projection.status).toBe("ON_TRACK");
    expect(projection.avgMonthlyGrowth).toBeCloseTo(6400, 0);
    expect(projection.monthsNeeded).toBe(54);
    expect(projection.projectedDate).toBe("2030-12");
    expect(projection.progressPercent).toBeCloseTo(31.4, 0); // 157,000 / 500,000 * 100
  });

  it("returns OFF_PACE when average monthly growth is negative", () => {
    // Create a declining series
    const decline: Snapshot[] = [
      { ...jan2026, netWorth: 100000, month: "2026-01" },
      { ...feb2026, netWorth: 95000, month: "2026-02" },
    ];
    const projection = projectGoal(decline, retireGoal);
    expect(projection.status).toBe("OFF_PACE");
    expect(projection.projectedDate).toBeNull();
    expect(projection.avgMonthlyGrowth).toBeLessThan(0);
  });

  it("returns BEHIND_PACE when projected date exceeds target date", () => {
    // Very ambitious goal that can't be reached in time
    const ambitiousGoal: Goal = {
      ...retireGoal,
      targetNetWorth: 10000000, // £10M
      targetDate: "2027-01", // Only 7 months away
    };
    const projection = projectGoal(allSnapshots, ambitiousGoal);
    expect(projection.status).toBe("BEHIND_PACE");
    expect(projection.projectedDate).not.toBeNull();
    expect(projection.monthsNeeded).toBeGreaterThan(0);
  });
});
