// ─── WhatIfSimulator ─────────────────────────────────────────────────────────
// Interactive slider: "What if I save £X more per month?"
// Updates the goal projection in real-time with hypothetical growth.

"use client";

import { useState } from "react";
import { projectGoal, addMonths } from "@/lib/engines/projectionEngine";
import type { Snapshot, Goal } from "@/lib/types";

interface WhatIfSimulatorProps {
  snapshots: Snapshot[];
  goal: Goal;
}

function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  return (value < 0 ? "-" : "") + "\u00a3" + abs.toLocaleString("en-US", { minimumFractionDigits: 0 });
}

export default function WhatIfSimulator({ snapshots, goal }: WhatIfSimulatorProps) {
  const [extraSaving, setExtraSaving] = useState(0);

  // Get base projection
  const baseProjection = projectGoal(snapshots, goal);

  // Simulate with extra savings: add to the last snapshot's net worth
  // and re-project over 6 months
  const simulatedSnapshots = [...snapshots];
  if (simulatedSnapshots.length > 0 && extraSaving > 0) {
    const last = { ...simulatedSnapshots[simulatedSnapshots.length - 1] };
    // Simulate 6 months of extra savings
    for (let i = 1; i <= 6; i++) {
      const sim = { ...last };
      sim.netWorth += extraSaving * i;
      const [y, m] = addMonths(last.month, i).split("-").map(Number);
      sim.month = `${y}-${String(m).padStart(2, "0")}`;
      simulatedSnapshots.push(sim);
    }
  }

  const simProjection = projectGoal(simulatedSnapshots, goal);

  return (
    <div className="rounded border border-slate/20 bg-white p-5 space-y-4">
      <p className="text-sm font-medium text-ink">What-if Simulator</p>
      <p className="text-xs text-slate">
        See how extra monthly savings would affect your goal.
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate">Extra monthly saving</span>
          <span className="font-mono text-ink font-medium">
            {formatCurrency(extraSaving)}/mo
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={5000}
          step={100}
          value={extraSaving}
          onChange={(e) => setExtraSaving(Number(e.target.value))}
          className="w-full accent-brass"
        />
        <div className="flex justify-between text-[10px] text-slate/40">
          <span>\u00a30</span>
          <span>\u00a35,000</span>
        </div>
      </div>

      {/* Comparison */}
      {baseProjection.status !== "INSUFFICIENT_DATA" && (
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded bg-slate/5 p-3">
            <p className="text-slate">Current pace</p>
            <p className="mt-1 font-mono font-medium text-ink">
              {baseProjection.projectedDate ?? "Off pace"}
            </p>
            <p className="text-slate/50">
              {baseProjection.monthsNeeded ?? "\u2014"} months
            </p>
          </div>
          <div className="rounded bg-brass/5 p-3">
            <p className="text-slate">With extra savings</p>
            <p className="mt-1 font-mono font-medium text-brass">
              {extraSaving > 0
                ? simProjection.projectedDate ?? "Off pace"
                : "\u2014"}
            </p>
            <p className="text-brass/60">
              {extraSaving > 0 && simProjection.monthsNeeded
                ? `${baseProjection.monthsNeeded! - simProjection.monthsNeeded} months sooner`
                : "\u2014"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
