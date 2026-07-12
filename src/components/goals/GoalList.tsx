// ─── GoalList ────────────────────────────────────────────────────────────────
// Displays goals with progress bars, projection status, edit/delete actions.

"use client";

import Link from "next/link";
import type { Goal, GoalProjection, Snapshot } from "@/lib/types";
import { projectGoal } from "@/lib/engines/projectionEngine";

interface GoalListProps {
  goals: Goal[];
  snapshots: Snapshot[];
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  isDeleting: boolean;
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

export default function GoalList({
  goals,
  snapshots,
  onEdit,
  onDelete,
  isDeleting,
}: GoalListProps) {
  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded border border-dashed border-slate/30 px-6 py-16 text-center">
        <div className="rounded-full bg-brass/10 p-4">
          <svg className="h-8 w-8 text-brass" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <h2 className="text-lg font-medium text-ink">No goals yet</h2>
        <p className="max-w-sm text-sm text-slate">
          Set a goal like &ldquo;Retire by 55&rdquo; or &ldquo;House deposit&rdquo;
          and Meridian will project your pace using your snapshot history.
        </p>
      </div>
    );
  }

  const currentNetWorth =
    snapshots.length > 0 ? snapshots[snapshots.length - 1].netWorth : 0;

  return (
    <div className="space-y-4">
      {goals.map((goal) => {
        const projection = projectGoal(snapshots, goal);
        const config = statusConfig[projection.status] ?? statusConfig.INSUFFICIENT_DATA;
        const progress = Math.min(projection.progressPercent, 100);

        return (
          <div
            key={goal.id}
            className="rounded border border-slate/20 bg-white p-5 space-y-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-ink">{goal.label}</h3>
                <p className="text-xs text-slate">
                  {formatCurrency(goal.targetNetWorth, goal.currency)} by{" "}
                  {goal.targetDate}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(goal)}
                  className="rounded p-1.5 text-slate/40 hover:bg-slate/5 hover:text-ink transition-colors"
                  aria-label="Edit goal"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(goal.id)}
                  disabled={isDeleting}
                  className="rounded p-1.5 text-slate/40 hover:bg-clay/10 hover:text-clay transition-colors disabled:opacity-30"
                  aria-label="Delete goal"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate">
                  {formatCurrency(currentNetWorth, goal.currency)}
                </span>
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
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate/10">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: config.bg,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate">{progress.toFixed(0)}%</span>

                {projection.status === "ON_TRACK" && projection.projectedDate && (
                  <span className="text-signal-sage">
                    On track for {projection.projectedDate}
                  </span>
                )}
                {projection.status === "BEHIND_PACE" && projection.projectedDate && (
                  <span className="text-clay">
                    Behind — projected {projection.projectedDate}
                  </span>
                )}
                {projection.status === "OFF_PACE" && (
                  <span className="text-clay">Not on pace</span>
                )}
                {projection.status === "INSUFFICIENT_DATA" && (
                  <span className="text-slate">
                    {snapshots.length < 1
                      ? "Add your first snapshot"
                      : "Need one more snapshot"}
                  </span>
                )}
                {projection.status === "ACHIEVED" && (
                  <span className="text-signal-sage">Goal achieved!</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
