import { describe, it, expect } from "vitest";
import { prefillSnapshot, lockSnapshot, unlockSnapshot } from "../lockEngine";
import type { Snapshot, FxRates } from "../../types";

// ─── Setup ───────────────────────────────────────────────────────────────────

const gbpRates: FxRates = {
  USD: 1.27,
  GBP: 1.0,
  EUR: 1.16,
  AUD: 1.95,
  CAD: 1.72,
};

const priorSnapshot: Snapshot = {
  id: "s1",
  userId: "user-1",
  month: "2026-02",
  status: "locked",
  baseCurrency: "GBP",
  fxRatesUsed: gbpRates,
  assets: [
    { id: "a1", name: "Cash", category: "Cash", currency: "GBP", value: 15000, valueInBaseCurrency: 15000 },
    { id: "a2", name: "ISA", category: "Investments", currency: "GBP", value: 40000, valueInBaseCurrency: 40000 },
  ],
  liabilities: [
    { id: "l1", name: "Mortgage", category: "Mortgage", currency: "GBP", value: 380000, valueInBaseCurrency: 380000 },
  ],
  totalAssets: 55000,
  totalLiabilities: 380000,
  netWorth: -325000,
  lockedAt: "2026-02-28T23:59:00Z",
  notes: "",
};

// ─── prefillSnapshot ─────────────────────────────────────────────────────────

describe("prefillSnapshot", () => {
  it("creates empty snapshot when there is no prior month", () => {
    const result = prefillSnapshot("user-1", "2026-01", null, "GBP");
    expect(result.month).toBe("2026-01");
    expect(result.status).toBe("draft");
    expect(result.assets).toEqual([]);
    expect(result.liabilities).toEqual([]);
  });

  it("copies entries from prior month", () => {
    const result = prefillSnapshot("user-1", "2026-03", priorSnapshot, "GBP");
    expect(result.assets).toHaveLength(2);
    expect(result.liabilities).toHaveLength(1);

    // Values carried forward
    expect(result.assets[0].name).toBe("Cash");
    expect(result.assets[0].value).toBe(15000);
    expect(result.assets[1].name).toBe("ISA");
    expect(result.assets[1].value).toBe(40000);
    expect(result.liabilities[0].name).toBe("Mortgage");
    expect(result.liabilities[0].value).toBe(380000);

    // New IDs generated
    expect(result.assets[0].id).not.toBe("a1");
    expect(result.liabilities[0].id).not.toBe("l1");
  });

  it("new snapshot has zero totals (not carried forward)", () => {
    const result = prefillSnapshot("user-1", "2026-03", priorSnapshot, "GBP");
    // Totals are zero because valueInBaseCurrency was copied as-is from prior,
    // but the snapshot hasn't been recalculated yet (that's the UI's job).
    expect(result.totalAssets).toBe(0);
    expect(result.totalLiabilities).toBe(0);
    expect(result.netWorth).toBe(0);
  });
});

// ─── lockSnapshot ────────────────────────────────────────────────────────────

describe("lockSnapshot", () => {
  it("freezes FX rates, recalculates totals, sets status to locked", () => {
    const draft = prefillSnapshot("user-1", "2026-03", priorSnapshot, "GBP");
    // Add an updated value
    draft.assets[0].value = 16000;

    const locked = lockSnapshot(draft, gbpRates);

    expect(locked.status).toBe("locked");
    expect(locked.fxRatesUsed).toEqual(gbpRates);
    expect(locked.lockedAt).not.toBeNull();
    expect(locked.totalAssets).toBe(56000); // 16000 + 40000
    expect(locked.totalLiabilities).toBe(380000);
    expect(locked.netWorth).toBe(-324000);
  });

  it("stores a copy of fxRates, not a reference", () => {
    const draft = prefillSnapshot("user-1", "2026-03", priorSnapshot, "GBP");
    const mutableRates: FxRates = { ...gbpRates };

    const locked = lockSnapshot(draft, mutableRates);
    expect(locked.fxRatesUsed).toEqual(mutableRates);

    // Mutating original shouldn't affect the snapshot
    mutableRates.GBP = 999;
    expect(locked.fxRatesUsed!.GBP).toBe(1.0);
  });
});

// ─── unlockSnapshot ──────────────────────────────────────────────────────────

describe("unlockSnapshot", () => {
  it("reverts a locked snapshot to DRAFT and clears lock data", () => {
    const draft = prefillSnapshot("user-1", "2026-03", priorSnapshot, "GBP");
    const locked = lockSnapshot(draft, gbpRates);

    const unlocked = unlockSnapshot(locked);

    expect(unlocked.status).toBe("draft");
    expect(unlocked.fxRatesUsed).toBeNull();
    expect(unlocked.lockedAt).toBeNull();
  });
});
