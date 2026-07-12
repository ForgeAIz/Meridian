// ─── Projection Engine ───────────────────────────────────────────────────────
// Pure function for goal projection calculations.
// Determines whether a user is on track to reach a financial goal,
// and estimates the projected completion date.

import type { Snapshot, Goal, GoalProjection, NetWorthPoint } from "../types";
import { netWorthSeries } from "./aggregationEngine";

/**
 * Computes the mean of an array of numbers.
 * Returns null for empty arrays.
 */
function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Adds a number of months to a month string ("2026-03") and returns
 * the result as a month string.
 *
 * @param month - Starting month in "YYYY-MM" format
 * @param monthsToAdd - Number of months to add (must be non-negative)
 * @returns The resulting month string
 */
export function addMonths(month: string, monthsToAdd: number): string {
  const [yearStr, monthStr] = month.split("-");
  let year = parseInt(yearStr, 10);
  let m = parseInt(monthStr, 10);

  m += monthsToAdd;
  while (m > 12) {
    m -= 12;
    year += 1;
  }
  while (m < 1) {
    m += 12;
    year -= 1;
  }

  return `${year}-${String(m).padStart(2, "0")}`;
}

/**
 * Projects a goal's status and estimated completion date based on
 * the user's locked snapshot history.
 *
 * Uses a trailing 6-month window of net worth changes to compute
 * average monthly growth. If the user has fewer than 2 snapshots,
 * returns INSUFFICIENT_DATA. If growth is zero or negative, returns
 * OFF_PACE with no projected date.
 *
 * @param snapshots - All locked snapshots for the user (sorted or unsorted)
 * @param goal - The goal to project
 * @returns A GoalProjection with status, projected date, and supporting numbers
 */
export function projectGoal(snapshots: Snapshot[], goal: Goal): GoalProjection {
  const series = netWorthSeries(snapshots);

  // Current net worth is the most recent snapshot's value
  const current = series.length > 0 ? series[series.length - 1].netWorth : 0;

  // Progress percent
  let progressPercent = 0;
  if (goal.targetNetWorth > 0) {
    progressPercent = (current / goal.targetNetWorth) * 100;
  }

  // === INSUFFICIENT_DATA: fewer than 2 snapshots ===
  if (series.length < 2) {
    return {
      status: "INSUFFICIENT_DATA",
      avgMonthlyGrowth: null,
      projectedDate: null,
      monthsNeeded: null,
      progressPercent,
    };
  }

  // === Check if goal is already achieved ===
  if (current >= goal.targetNetWorth) {
    return {
      status: "ACHIEVED",
      avgMonthlyGrowth: null,
      projectedDate: null,
      monthsNeeded: 0,
      progressPercent: Math.min(progressPercent, 100),
    };
  }

  // === Compute trailing 6-month average monthly growth ===
  const trailing = series.slice(-6);
  const deltas: number[] = [];

  for (let i = 1; i < trailing.length; i++) {
    deltas.push(trailing[i].netWorth - trailing[i - 1].netWorth);
  }

  const avgMonthlyGrowth = mean(deltas);

  // Guard: avgMonthlyGrowth should always be non-null if series >= 2
  if (avgMonthlyGrowth === null) {
    return {
      status: "INSUFFICIENT_DATA",
      avgMonthlyGrowth: null,
      projectedDate: null,
      monthsNeeded: null,
      progressPercent,
    };
  }

  // === OFF_PACE: zero or negative growth ===
  if (avgMonthlyGrowth <= 0) {
    return {
      status: "OFF_PACE",
      avgMonthlyGrowth,
      projectedDate: null,
      monthsNeeded: null,
      progressPercent,
    };
  }

  // === Compute projected date ===
  const remaining = goal.targetNetWorth - current;
  const monthsNeeded = Math.ceil(remaining / avgMonthlyGrowth);
  const projectedDate = addMonths(series[series.length - 1].month, monthsNeeded);

  // === Determine ON_TRACK vs BEHIND_PACE ===
  const status: "ON_TRACK" | "BEHIND_PACE" =
    projectedDate <= goal.targetDate ? "ON_TRACK" : "BEHIND_PACE";

  return {
    status,
    avgMonthlyGrowth,
    projectedDate,
    monthsNeeded,
    progressPercent,
  };
}
