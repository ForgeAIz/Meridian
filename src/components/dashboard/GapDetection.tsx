// ─── GapDetection ────────────────────────────────────────────────────────────
// Detects when a user has missed months and offers to catch up or skip ahead.
// Shows once per gap, stored in sessionStorage to avoid repeated prompts.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Snapshot } from "@/lib/types";

interface GapDetectionProps {
  snapshots: Snapshot[];
}

function getCurrentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Returns the gap months between the latest locked snapshot and now.
 * Returns empty array if no gap exists.
 */
function getGapMonths(snapshots: Snapshot[]): string[] {
  const locked = snapshots
    .filter((s) => s.status === "locked")
    .sort((a, b) => a.month.localeCompare(b.month));

  if (locked.length === 0) return [];

  const latest = locked[locked.length - 1].month;
  const current = getCurrentMonth();

  if (latest >= current) return []; // Already up to date

  // Build list of missing months
  const gaps: string[] = [];
  let [year, month] = advanceMonth(latest);
  const [endYear, endMonth] = current.split("-").map(Number);

  while (year < endYear || (year === endYear && month <= endMonth)) {
    const m = `${year}-${String(month).padStart(2, "0")}`;
    gaps.push(m);
    [year, month] = advanceMonth(m);
  }

  return gaps;
}

function advanceMonth(m: string): [number, number] {
  let [y, mo] = m.split("-").map(Number);
  mo += 1;
  if (mo > 12) { mo = 1; y += 1; }
  return [y, mo];
}

export default function GapDetection({ snapshots }: GapDetectionProps) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(
    typeof window !== "undefined" && sessionStorage.getItem("meridian-gap-dismissed") ? true : false
  );

  const gapMonths = getGapMonths(snapshots);
  const hasGap = gapMonths.length > 0;

  // Log gap state but don't setState in effect
  useEffect(() => {
    if (hasGap && dismissed) {
      // Session already dismissed — no action needed
    }
  }, [hasGap, dismissed]);

  if (!hasGap || dismissed) return null;

  function handleFillIn() {
    sessionStorage.setItem("meridian-gap-dismissed", "true");
    // Redirect to the first missing month
    router.push(`/entry?month=${gapMonths[0]}`);
  }

  function handleSkip() {
    sessionStorage.setItem("meridian-gap-dismissed", "true");
    setDismissed(true);
    // Redirect to current month's entry
    router.push(`/entry?month=${getCurrentMonth()}`);
  }

  function handleDismiss() {
    sessionStorage.setItem("meridian-gap-dismissed", "true");
    setDismissed(true);
  }

  const missingLabel =
    gapMonths.length === 1
      ? `${gapMonths[0]} hasn't been recorded yet`
      : `${gapMonths.length} months (${gapMonths[0]} to ${gapMonths[gapMonths.length - 1]}) haven't been recorded`;

  return (
    <div className="rounded border border-brass/30 bg-brass/5 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <svg className="h-5 w-5 text-brass" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-ink">Catch up on missing months?</p>
          <p className="mt-0.5 text-xs text-slate">{missingLabel}.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={handleFillIn}
              className="rounded bg-brass px-4 py-1.5 text-xs text-white transition-colors hover:bg-brass/90"
            >
              Fill in missing months
            </button>
            <button
              onClick={handleSkip}
              className="rounded border border-slate/20 bg-white px-4 py-1.5 text-xs text-slate transition-colors hover:bg-slate/5"
            >
              Skip ahead
            </button>
            <button
              onClick={handleDismiss}
              className="text-xs text-slate/50 hover:text-slate transition-colors px-2"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
