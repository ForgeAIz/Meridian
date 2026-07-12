// ─── AssetsVsLiabilitiesChart ───────────────────────────────────────────────
// Dual line chart: Total Assets (brass) vs Total Liabilities (deep teal).
// The visual gap between the lines IS net worth, made spatially obvious.

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { NetWorthPoint } from "@/lib/types";

interface AssetsVsLiabilitiesChartProps {
  assets: NetWorthPoint[];
  liabilities: NetWorthPoint[];
  currency: string;
}

function formatCurrency(value: number, currency: string): string {
  const symbols: Record<string, string> = { USD: "$", GBP: "£", EUR: "€", AUD: "A$", CAD: "C$" };
  const symbol = symbols[currency] ?? currency + " ";
  const abs = Math.abs(value);
  return (value < 0 ? "-" : "") + symbol + abs.toLocaleString("en-US", { minimumFractionDigits: 0 });
}

function CustomTooltip(props: Record<string, unknown>) {
  const { active, payload, label } = props as {
    active: boolean;
    payload?: Array<{ value: number; name: string; color: string }>;
    label: string;
  };
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded border border-slate/20 bg-white px-3 py-2 text-sm shadow-sm">
      <p className="text-xs text-slate">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="font-mono text-xs" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(Number(entry.value), "GBP")}
        </p>
      ))}
    </div>
  );
}

export default function AssetsVsLiabilitiesChart({
  assets,
  liabilities,
  currency,
}: AssetsVsLiabilitiesChartProps) {
  if (assets.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded bg-slate/5">
        <p className="text-sm text-slate/50">Add snapshots to see this chart</p>
      </div>
    );
  }

  const chartData = assets.map((a, i) => ({
    month: a.month.slice(5),
    Assets: a.netWorth,
    Liabilities: liabilities[i]?.netWorth ?? 0,
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-slate)" strokeOpacity={0.15} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "var(--color-slate)" }}
            axisLine={{ stroke: "var(--color-slate)", strokeOpacity: 0.2 }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--color-slate)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatCurrency(v, currency)}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "var(--color-slate)" }}
          />
          <Line
            type="monotone"
            dataKey="Assets"
            stroke="var(--color-brass)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Liabilities"
            stroke="var(--color-deep-teal)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
