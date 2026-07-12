// ─── Annual Review Page ─────────────────────────────────────────────────────
// Year-in-review: start/end net worth, best/worst months, monthly averages.

"use client";

import { useState } from "react";
import Link from "next/link";
import { useDashboardData } from "@/hooks/useDashboardData";
import { annualReview } from "@/lib/engines/aggregationEngine";

function formatCurrency(value: number, currency: string): string {
  const symbols: Record<string, string> = { USD: "$", GBP: "\u00a3", EUR: "\u20ac", AUD: "A$", CAD: "C$" };
  const symbol = symbols[currency] ?? currency + " ";
  const abs = Math.abs(value);
  return (value < 0 ? "-" : "") + symbol + abs.toLocaleString("en-US", { minimumFractionDigits: 0 });
}

export default function ReviewPage() {
  const { data, isLoading } = useDashboardData();
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate/30 border-t-brass" />
      </div>
    );
  }

  if (!data || data.snapshots.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl text-ink">Annual Review</h1>
        <p className="text-sm text-slate">Add some snapshots to see your annual review.</p>
        <Link href="/entry" className="text-sm text-brass hover:underline">Add your first snapshot</Link>
      </div>
    );
  }

  // Get available years from snapshots
  const years = [...new Set(data.snapshots.map((s) => s.month.slice(0, 4)))].sort().reverse();
  const review = annualReview(data.snapshots, selectedYear);
  const currency = data.latestSnapshot?.baseCurrency ?? "GBP";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Annual Review</h1>
          <p className="mt-1 text-sm text-slate">Your year at a glance.</p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="rounded border border-slate/20 bg-white px-3 py-2 text-sm text-ink focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {!review ? (
        <div className="flex flex-col items-center gap-4 rounded border border-dashed border-slate/30 px-6 py-16 text-center">
          <p className="text-sm text-slate">No snapshots recorded in {selectedYear}.</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard label="Start of year" value={formatCurrency(review.startNetWorth ?? 0, currency)} />
            <SummaryCard label="End of year" value={formatCurrency(review.endNetWorth ?? 0, currency)} />
            <SummaryCard
              label="Total change"
              value={`${review.totalChange! >= 0 ? "+" : ""}${formatCurrency(review.totalChange ?? 0, currency)}`}
              color={review.totalChange! >= 0 ? "var(--color-signal-sage)" : "var(--color-clay)"}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard
              label="Avg monthly change"
              value={`${review.avgMonthlyChange! >= 0 ? "+" : ""}${formatCurrency(review.avgMonthlyChange ?? 0, currency)}`}
              color={review.avgMonthlyChange! >= 0 ? "var(--color-signal-sage)" : "var(--color-clay)"}
            />
            {review.totalChangePercent !== null && (
              <SummaryCard
                label="Total change %"
                value={`${review.totalChangePercent >= 0 ? "+" : ""}${review.totalChangePercent.toFixed(1)}%`}
                color={review.totalChangePercent >= 0 ? "var(--color-signal-sage)" : "var(--color-clay)"}
              />
            )}
            <SummaryCard label="Months recorded" value={`${review.monthsActive} / 12`} />
          </div>

          {/* Best & Worst months */}
          <div className="grid gap-4 md:grid-cols-2">
            {review.bestMonth && (
              <div className="rounded border border-signal-sage/20 bg-signal-sage/5 p-5 space-y-2">
                <p className="text-xs font-medium text-signal-sage uppercase tracking-wider">Best Month</p>
                <p className="font-display text-lg text-signal-sage">{review.bestMonth.month}</p>
                <p className="font-mono text-sm text-signal-sage">
                  +{formatCurrency(review.bestMonth.delta, currency)}
                </p>
              </div>
            )}
            {review.worstMonth && (
              <div className="rounded border border-clay/20 bg-clay/5 p-5 space-y-2">
                <p className="text-xs font-medium text-clay uppercase tracking-wider">Worst Month</p>
                <p className="font-display text-lg text-clay">{review.worstMonth.month}</p>
                <p className="font-mono text-sm text-clay">
                  {formatCurrency(review.worstMonth.delta, currency)}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded border border-slate/20 p-5 space-y-1">
      <p className="text-xs text-slate">{label}</p>
      <p className="font-display text-xl tracking-tight" style={{ color: color ?? "var(--color-ink)" }}>
        {value}
      </p>
    </div>
  );
}
