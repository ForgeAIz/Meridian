// ─── GoalCard ───────────────────────────────────────────────────────────────
// Shows goal progress bar, projected date, and on-track status badge.

"use client";

import type { Goal, GoalProjection, Snapshot } from "@/lib/types";

interface GoalCardProps {
  goal: Goal;
  projection: GoalProjection;
  latestSnapshot: Snapshot | null;
}

function formatCurrency(value: number, currency: string): string {
  const symbols: Record<string, string> = { USD: "$", GBP: "£", EUR: "€", AUD: "A$", CAD: "C$" };
  const symbol = symbols[currency] ?? currency + " ";
  const abs = Math.abs(value);
  return (value < 0 ? "-" : "") + symbol + abs.toLocaleString("en-US", { minimumFractionDigits: 0 });
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  ON_TRACK: { label: "On track", color: "var(--color-signal-sage)", bg: "var(--color-signal-sage)" },
  BEHIND_PACE: { label: "Behind pace", color: "var(--color-clay)", bg: "var(--color-clay)" },
  OFF_PACE: { label: "Off pace", color: "var(--color-clay)", bg: "var(--color-clay)" },
  INSUFFICIENT_DATA: { label: "Need more data", color: "var(--color-slate)", bg: "var(--color-slate)" },
  ACHIEVED: { label: "Achieved!", color: "var(--color-signal-sage)", bg: "var(--color-signal-sage)" },
};

export default function GoalCard({ goal, projection, latestSnapshot }: GoalCardProps) {
  const config = statusConfig[projection.status] ?? statusConfig.INSUFFICIENT_DATA;
  const progress = Math.min(projection.progressPercent, 100);
  const current = latestSnapshot?.netWorth ?? 0;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-ink">{goal.label}</p>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-slate">
          <span>{formatCurrency(current, goal.currency)}</span>
          <span>{formatCurrency(goal.targetNetWorth, goal.currency)}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate/10">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              backgroundColor: config.bg,
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate">{progress.toFixed(0)}%</span>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: `${config.bg}15`,
              color: config.color,
            }}
          >
            {config.label}
          </span>
        </div>
      </div>

      {projection.status === "ON_TRACK" && projection.projectedDate && (
        <p className="text-xs text-signal-sage">
          On track for {projection.projectedDate} —{" "}
          {projection.monthsNeeded} months at current pace
        </p>
      )}

      {projection.status === "BEHIND_PACE" && projection.projectedDate && (
        <p className="text-xs text-clay">
          Projected {projection.projectedDate} — behind target of {goal.targetDate}
        </p>
      )}

      {projection.status === "OFF_PACE" && (
        <p className="text-xs text-clay">
          Not currently on pace. Growth is negative or flat.
        </p>
      )}

      {projection.status === "INSUFFICIENT_DATA" && (
        <p className="text-xs text-slate">
          {latestSnapshot
            ? "Add one more snapshot to see your projected pace."
            : "Add your first snapshot to start tracking."}
        </p>
      )}

      {projection.status === "ACHIEVED" && (
        <p className="text-xs text-signal-sage">
          Goal achieved! Current net worth exceeds your target.
        </p>
      )}
    </div>
  );
}
