// ─── Aggregation Engine ──────────────────────────────────────────────────────
// Pure functions that operate on locked snapshots to produce dashboard data.
// Every function is a deterministic transformation: same locked snapshots in,
// same chart data out. No side effects, no mutation of inputs.

import type {
  Snapshot,
  NetWorthPoint,
  LeveragePoint,
  CategoryAllocation,
  MomChangeResult,
  TrendLabel,
  AssetEntry,
  LiabilityEntry,
} from "../types";

/**
 * Builds the net worth time series from all locked snapshots.
 *
 * Returns points sorted by month ascending. Each point is the net worth
 * as it was recorded at lock time — no live recalculation of history.
 *
 * @param snapshots - All locked snapshots for a user
 * @returns Ordered array of { month, netWorth } points
 */
export function netWorthSeries(snapshots: Snapshot[]): NetWorthPoint[] {
  return snapshots
    .filter((s) => s.status === "locked")
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((s) => ({
      month: s.month,
      netWorth: s.netWorth,
    }));
}

/**
 * Builds the leverage ratio time series.
 *
 * Ratio = totalLiabilities / totalAssets.
 * Months where totalAssets === 0 are excluded to prevent division by zero.
 *
 * @param snapshots - All locked snapshots for a user
 * @returns Ordered array of { month, ratio } points
 */
export function leverageRatioSeries(snapshots: Snapshot[]): LeveragePoint[] {
  return snapshots
    .filter((s) => s.status === "locked" && s.totalAssets > 0)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((s) => ({
      month: s.month,
      ratio: s.totalLiabilities / s.totalAssets,
    }));
}

/**
 * Computes category allocation percentages for either assets or liabilities.
 *
 * Returns an array of { category, total, percent } objects, sorted by
 * total descending (largest allocation first). Used to drive the two pie charts.
 *
 * @param entries - All entries of one type (assets or liabilities) from a single snapshot
 * @param total - The grand total (sum of all valueInBaseCurrency for this entry type)
 * @returns Array of category allocations with absolute and percentage values
 */
export function categoryAllocation(
  entries: (AssetEntry | LiabilityEntry)[],
  total: number
): CategoryAllocation[] {
  if (total === 0) {
    return [];
  }

  const grouped = new Map<string, number>();

  for (const entry of entries) {
    const current = grouped.get(entry.category) ?? 0;
    grouped.set(entry.category, current + entry.valueInBaseCurrency);
  }

  const result: CategoryAllocation[] = [];

  for (const [category, categoryTotal] of grouped) {
    result.push({
      category,
      total: categoryTotal,
      percent: (categoryTotal / total) * 100,
    });
  }

  // Sort descending by total
  result.sort((a, b) => b.total - a.total);

  return result;
}

/**
 * Computes month-over-month change for a given month against the previous month.
 *
 * For the first-ever snapshot (no prior month), returns null.
 * Percent change uses abs(previousNetWorth) in the denominator so that
 * a swing from -£5,000 to -£2,000 correctly shows as positive improvement.
 *
 * @param snapshots - All locked snapshots sorted by month
 * @param month - The month to compute change for
 * @returns The MoM change result, or null if there's no prior month
 */
export function momChange(snapshots: Snapshot[], month: string): MomChangeResult | null {
  const sorted = [...snapshots]
    .filter((s) => s.status === "locked")
    .sort((a, b) => a.month.localeCompare(b.month));

  const currentIdx = sorted.findIndex((s) => s.month === month);

  if (currentIdx <= 0) {
    return null; // First month — no prior data to compare against
  }

  const current = sorted[currentIdx];
  const previous = sorted[currentIdx - 1];

  const delta = current.netWorth - previous.netWorth;

  let percent: number | null = null;

  if (previous.netWorth !== 0) {
    percent = (delta / Math.abs(previous.netWorth)) * 100;
  }

  return { delta, percent };
}

/**
 * Computes the assets vs liabilities series for the dual-line chart.
 *
 * Returns two parallel arrays (one for assets, one for liabilities)
 * indexed by month. Both are in the user's base currency.
 *
 * @param snapshots - All locked snapshots for a user
 * @returns Object with assets and liabilities arrays, each with month and value
 */
export function assetsVsLiabilitiesSeries(snapshots: Snapshot[]): {
  assets: NetWorthPoint[];
  liabilities: NetWorthPoint[];
} {
  const sorted = [...snapshots]
    .filter((s) => s.status === "locked")
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    assets: sorted.map((s) => ({ month: s.month, netWorth: s.totalAssets })),
    liabilities: sorted.map((s) => ({ month: s.month, netWorth: s.totalLiabilities })),
  };
}

/**
 * Generates a trend direction label for the leverage ratio based on
 * the last 3 months' trajectory.
 *
 * - "Improving" when the ratio is falling (paying down debt)
 * - "Rising" when the ratio is increasing (taking on more debt)
 * - "Stable" when the ratio is flat (change < 0.005 over 3 months)
 *
 * @param points - Leverage ratio time series
 * @returns A trend label
 */
export function leverageTrendLabel(points: LeveragePoint[]): TrendLabel {
  if (points.length < 3) {
    return { direction: "Stable" };
  }

  const recent = points.slice(-3);
  const first = recent[0].ratio;
  const last = recent[recent.length - 1].ratio;
  const change = last - first;

  if (Math.abs(change) < 0.005) {
    return { direction: "Stable" };
  }

  return change < 0 ? { direction: "Improving" } : { direction: "Rising" };
}

/**
 * Computes the value of a single category across all locked snapshots.
 * Used for category drill-down: click a pie slice → see that category's trend.
 *
 * @param snapshots - All locked snapshots for a user
 * @param category - The category to isolate (e.g. "Investments", "Mortgage")
 * @param type - "asset" or "liability"
 * @returns Array of { month, value } points, sorted by month
 */
export function categoryTrend(
  snapshots: Snapshot[],
  category: string,
  type: "asset" | "liability"
): NetWorthPoint[] {
  const sorted = [...snapshots]
    .filter((s) => s.status === "locked")
    .sort((a, b) => a.month.localeCompare(b.month));

  return sorted.map((s) => {
    const entries = type === "asset" ? s.assets : s.liabilities;
    const total = entries
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + e.valueInBaseCurrency, 0);
    return { month: s.month, netWorth: total };
  });
}

/**
 * Computes a trailing N-month average of MoM change as a savings rate proxy.
 * Since Meridian doesn't see income/spending, this approximates savings rate
 * from net worth changes with market movement roughly netted out.
 *
 * @param momChanges - Array of MomChangeResult values (one per month, excluding first)
 * @param windowMonths - Trailing window size (default 3)
 * @returns The average monthly change, or null if insufficient data
 */
export function savingsRateProxy(
  momChanges: (MomChangeResult | null)[],
  windowMonths: number = 3
): { avgDelta: number | null; avgPercent: number | null } {
  const valid = momChanges.filter((m): m is MomChangeResult => m !== null);
  if (valid.length < 2) return { avgDelta: null, avgPercent: null };

  const trailing = valid.slice(-windowMonths);
  const avgDelta = trailing.reduce((sum, m) => sum + m.delta, 0) / trailing.length;
  const validPct = trailing.filter((m) => m.percent !== null);
  const avgPercent =
    validPct.length > 0
      ? validPct.reduce((sum, m) => sum + (m.percent ?? 0), 0) / validPct.length
      : null;

  return { avgDelta, avgPercent };
}

/**
 * Computes an annual summary: total snapshots, start/end net worth,
 * total change, average monthly change, best and worst months.
 *
 * @param snapshots - All locked snapshots for a user
 * @param year - The year to summarize (e.g. "2026")
 * @returns Annual summary or null if insufficient data
 */
export function annualReview(
  snapshots: Snapshot[],
  year: string
): {
  year: string;
  snapshotCount: number;
  startNetWorth: number | null;
  endNetWorth: number | null;
  totalChange: number | null;
  totalChangePercent: number | null;
  avgMonthlyChange: number | null;
  bestMonth: { month: string; delta: number } | null;
  worstMonth: { month: string; delta: number } | null;
  monthsActive: number;
} | null {
  const yearSnapshots = [...snapshots]
    .filter((s) => s.status === "locked" && s.month.startsWith(year))
    .sort((a, b) => a.month.localeCompare(b.month));

  if (yearSnapshots.length === 0) return null;

  const first = yearSnapshots[0];
  const last = yearSnapshots[yearSnapshots.length - 1];
  const totalChange = last.netWorth - first.netWorth;
  const totalChangePercent =
    first.netWorth !== 0
      ? (totalChange / Math.abs(first.netWorth)) * 100
      : null;

  // Compute MoM changes within the year
  const deltas: { month: string; delta: number }[] = [];
  for (let i = 1; i < yearSnapshots.length; i++) {
    deltas.push({
      month: yearSnapshots[i].month,
      delta: yearSnapshots[i].netWorth - yearSnapshots[i - 1].netWorth,
    });
  }

  const avgMonthlyChange =
    deltas.length > 0
      ? deltas.reduce((sum, d) => sum + d.delta, 0) / deltas.length
      : null;

  const bestMonth =
    deltas.length > 0
      ? deltas.reduce((best, d) => (d.delta > best.delta ? d : best))
      : null;

  const worstMonth =
    deltas.length > 0
      ? deltas.reduce((worst, d) => (d.delta < worst.delta ? d : worst))
      : null;

  return {
    year,
    snapshotCount: yearSnapshots.length,
    startNetWorth: first.netWorth,
    endNetWorth: last.netWorth,
    totalChange,
    totalChangePercent,
    avgMonthlyChange,
    bestMonth,
    worstMonth,
    monthsActive: yearSnapshots.length,
  };
}
