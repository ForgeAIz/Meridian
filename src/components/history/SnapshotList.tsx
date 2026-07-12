// ─── SnapshotList ────────────────────────────────────────────────────────────
// List of all snapshots ordered by month (newest first).
// Shows status, net worth, and month. Click to view detail.

"use client";

import { useMemo } from "react";
import type { Snapshot } from "@/lib/types";

interface SnapshotListProps {
  snapshots: Snapshot[];
  selectedId?: string;
  onSelect: (snapshot: Snapshot) => void;
}

/** Build a tiny sparkline SVG path from all net worth values up to this point */
function sparklinePath(snapshots: Snapshot[], upToId: string): string {
  const sorted = snapshots
    .filter((s) => s.status === "locked")
    .sort((a, b) => a.month.localeCompare(b.month));

  const idx = sorted.findIndex((s) => s.id === upToId);
  if (idx < 1) return "";

  const slice = sorted.slice(0, idx + 1);
  const values = slice.map((s) => s.netWorth);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = slice.length - 1 || 1;

  return slice
    .map((s, i) => {
      const x = (i / w) * 40;
      const y = 16 - ((s.netWorth - min) / range) * 12;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-US", { minimumFractionDigits: 0 });
  return (value < 0 ? "-£" : "£") + formatted;
}

export default function SnapshotList({
  snapshots,
  selectedId,
  onSelect,
}: SnapshotListProps) {
  if (snapshots.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded border border-dashed border-slate/30 px-6 py-16 text-center">
        <div className="rounded-full bg-brass/10 p-4">
          <svg className="h-8 w-8 text-brass" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <h2 className="text-lg font-medium text-ink">No snapshots yet</h2>
        <p className="max-w-sm text-sm text-slate">
          Your monthly snapshots will appear here once you start recording.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {snapshots.map((snapshot) => {
        const isSelected = snapshot.id === selectedId;
        const isLocked = snapshot.status === "locked";
        const monthLabel = snapshot.month;

        return (
          <button
          key={snapshot.id}
          onClick={() => onSelect(snapshot)}
          className={`w-full flex items-center justify-between rounded-md border px-4 py-3 text-left transition-all ${
            isSelected
              ? "border-brass/40 bg-brass/5"
              : "border-slate/15 bg-white hover:border-slate/30 hover:-translate-y-0.5 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Status indicator */}
            <div
              className={`h-2 w-2 shrink-0 rounded-full ${
                isLocked ? "bg-brass" : "bg-slate/30"
              }`}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{monthLabel}</p>
              <p className="text-xs text-slate">
                {isLocked
                  ? `Locked ${snapshot.lockedAt ? new Date(snapshot.lockedAt).toLocaleDateString() : ""}`
                  : "Draft"}
              </p>
            </div>
          </div>

          {/* Sparkline */}
          <div className="shrink-0 mx-2">
            <svg width="40" height="16" viewBox="0 0 40 16" className="opacity-40">
              <path
                d={sparklinePath(snapshots, snapshot.id)}
                fill="none"
                stroke={snapshot.netWorth >= 0 ? "#A9813C" : "#B3654A"}
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="text-right shrink-0">
              <p
                className={`text-sm font-mono font-medium ${
                  snapshot.netWorth >= 0 ? "text-ink" : "text-clay"
                }`}
              >
                {formatCurrency(snapshot.netWorth)}
              </p>
              <p className="text-xs text-slate">
                {snapshot.assets.length + snapshot.liabilities.length} entries
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
