// ─── SavingsRateCard ─────────────────────────────────────────────────────────
// Shows the trailing 3-month average net worth change as a savings rate proxy.

"use client";

import type { MomChangeResult } from "@/lib/types";

interface SavingsRateCardProps {
  momChanges: (MomChangeResult | null)[];
  currency: string;
}

function formatCurrency(value: number, currency: string): string {
  const symbols: Record<string, string> = { USD: "$", GBP: "\u00a3", EUR: "\u20ac", AUD: "A$", CAD: "C$" };
  const symbol = symbols[currency] ?? currency + " ";
  const abs = Math.abs(value);
  return (value < 0 ? "-" : "") + symbol + abs.toLocaleString("en-US", { minimumFractionDigits: 0 });
}

export default function SavingsRateCard({ momChanges, currency }: SavingsRateCardProps) {
  // Compute trailing 3-month average
  const valid = momChanges.filter((m): m is MomChangeResult => m !== null);
  const trailing = valid.slice(-3);
  const avgDelta =
    trailing.length >= 2
      ? trailing.reduce((sum, m) => sum + m.delta, 0) / trailing.length
      : null;

  const avgPercent =
    trailing.length >= 2
      ? trailing.reduce((sum, m) => sum + (m.percent ?? 0), 0) / trailing.length
      : null;

  return (
    <div className="rounded border border-slate/20 p-5 chart-card space-y-2">
      <p className="text-sm font-medium text-ink">Average Monthly Change</p>

      {avgDelta === null ? (
        <div className="flex h-16 items-center justify-center">
          <p className="text-xs text-slate/50">
            {valid.length < 2
              ? "Need 2+ snapshots to calculate"
              : "Trailing 3 months not available"}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-display text-2xl tracking-tight ${
                avgDelta >= 0 ? "text-signal-sage" : "text-clay"
              }`}
            >
              {avgDelta >= 0 ? "+" : ""}
              {formatCurrency(avgDelta, currency)}
            </span>
            <span className="text-xs text-slate">/ month</span>
          </div>
          {avgPercent !== null && (
            <p
              className={`text-xs font-medium ${
                avgPercent >= 0 ? "text-signal-sage" : "text-clay"
              }`}
            >
              {avgPercent >= 0 ? "+" : ""}
              {avgPercent.toFixed(1)}% monthly
            </p>
          )}
          <p className="text-[10px] text-slate/50">
            Trailing {Math.min(trailing.length, 3)}-month average
          </p>
        </>
      )}
    </div>
  );
}
