// ─── CategoryTrendChart ──────────────────────────────────────────────────────
// Shows a single category's value over time. Used for drill-down:
// click a pie slice → this chart replaces the main trend chart.

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { NetWorthPoint } from "@/lib/types";

interface CategoryTrendChartProps {
  data: NetWorthPoint[];
  category: string;
  type: "asset" | "liability";
  currency: string;
  onBack: () => void;
}

function formatCurrency(value: number, currency: string): string {
  const symbols: Record<string, string> = { USD: "$", GBP: "\u00a3", EUR: "\u20ac", AUD: "A$", CAD: "C$" };
  const symbol = symbols[currency] ?? currency + " ";
  const abs = Math.abs(value);
  return (value < 0 ? "-" : "") + symbol + abs.toLocaleString("en-US", { minimumFractionDigits: 0 });
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded border border-slate/20 bg-white px-3 py-2 text-sm shadow-sm dark:bg-[#1a1e23] dark:border-slate/15">
      <p className="text-xs text-slate">{label}</p>
      <p className="font-mono font-medium text-ink">
        {formatCurrency(Number(payload[0].value), "GBP")}
      </p>
    </div>
  );
}

export default function CategoryTrendChart({
  data,
  category,
  type,
  currency,
  onBack,
}: CategoryTrendChartProps) {
  const color = type === "asset" ? "var(--color-brass)" : "var(--color-deep-teal)";

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs text-slate hover:text-ink transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back
          </button>
        </div>
        <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: `${color}15`, color }}>
          {category}
        </span>
      </div>

      {data.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded bg-slate/5">
          <p className="text-sm text-slate/50">No data for {category}</p>
        </div>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.map((d) => ({ month: d.month.slice(5), value: d.netWorth }))} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-slate)" strokeOpacity={0.15} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-slate)" }} axisLine={{ stroke: "var(--color-slate)", strokeOpacity: 0.2 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-slate)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCurrency(v, currency)} width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 3, fill: color, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
