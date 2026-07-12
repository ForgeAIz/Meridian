// ─── NetWorthTrendChart ──────────────────────────────────────────────────────
// Primary line chart: net worth over time.
// Brass-colored line. Hover tooltip shows exact figure and MoM change.

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

interface NetWorthTrendChartProps {
  data: NetWorthPoint[];
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
    payload?: Array<{ value: number }>;
    label: string;
  };
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded border border-slate/20 bg-white px-3 py-2 text-sm shadow-sm">
      <p className="text-xs text-slate">{label}</p>
      <p className="font-mono font-medium text-ink">
        {formatCurrency(Number(payload[0].value), "GBP")}
      </p>
    </div>
  );
}

export default function NetWorthTrendChart({ data, currency }: NetWorthTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded bg-slate/5">
        <p className="text-sm text-slate/50">
          Add 2+ snapshots to see your trend
        </p>
      </div>
    );
  }

  if (data.length === 1) {
    return (
      <div className="flex h-56 items-center justify-center rounded bg-slate/5">
        <p className="text-sm text-slate/50">
          One snapshot recorded. Add next month to start your trend.
        </p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    month: d.month.slice(5), // "03" instead of "2026-03"
    netWorth: d.netWorth,
  }));

  return (
    <div className="h-56">
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
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="netWorth"
            stroke="var(--color-brass)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--color-brass)", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "var(--color-brass)", strokeWidth: 2, stroke: "white" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
