// ─── LeverageRatioCard ──────────────────────────────────────────────────────
// Shows current leverage ratio, trend direction, and mini sparkline.

"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import type { LeveragePoint, TrendLabel } from "@/lib/types";

interface LeverageRatioCardProps {
  series: LeveragePoint[];
  trend: TrendLabel;
  latestSnapshot: { totalAssets: number; totalLiabilities: number } | null;
}

const trendColors: Record<string, string> = {
  Improving: "var(--color-signal-sage)",
  Stable: "var(--color-slate)",
  Rising: "var(--color-clay)",
};

export default function LeverageRatioCard({
  series,
  trend,
  latestSnapshot,
}: LeverageRatioCardProps) {
  const latestRatio = series.length > 0 ? series[series.length - 1].ratio : null;
  const trendColor = trendColors[trend.direction] ?? "var(--color-slate)";

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-ink">Net Leverage Ratio</p>

      {latestRatio === null ? (
        <div className="flex h-32 items-center justify-center rounded bg-slate/5">
          <p className="text-xs text-slate/50">Add snapshots to calculate</p>
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-3">
            <span className="font-display text-3xl tracking-tight" style={{ color: trendColor }}>
              {latestRatio.toFixed(2)}
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${trendColor}15`,
                color: trendColor,
              }}
            >
              {trend.direction}
            </span>
          </div>

          {/* Mini sparkline */}
          {series.length >= 2 && (
            <div className="h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={series.map((s) => ({ month: s.month.slice(5), ratio: s.ratio }))}
                  margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                >
                  <Line
                    type="monotone"
                    dataKey="ratio"
                    stroke={trendColor}
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {latestSnapshot && (
            <div className="flex justify-between text-xs text-slate">
              <span>Assets: {latestSnapshot.totalAssets.toLocaleString()}</span>
              <span>Liabilities: {latestSnapshot.totalLiabilities.toLocaleString()}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
