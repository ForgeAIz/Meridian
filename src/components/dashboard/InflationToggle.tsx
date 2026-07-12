// ─── InflationToggle ─────────────────────────────────────────────────────────
// Toggle between nominal and inflation-adjusted values on charts.
// Shows the inflation data source label when active.

"use client";

import { getInflationLabel } from "@/lib/inflation";

interface InflationToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  currency: string;
}

export default function InflationToggle({
  enabled,
  onToggle,
  currency,
}: InflationToggleProps) {
  const label = getInflationLabel(currency);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onToggle(!enabled)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          enabled ? "bg-brass" : "bg-slate/20"
        }`}
        aria-label="Toggle inflation adjustment"
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-4.5" : "translate-x-1"
          }`}
        />
      </button>
      <div className="flex items-center gap-1.5">
        <span className={`text-xs ${enabled ? "text-brass" : "text-slate/40"}`}>
          Real
        </span>
        {enabled && (
          <span className="text-[10px] text-slate/50">
            Adjusted for {label}
          </span>
        )}
      </div>
    </div>
  );
}
