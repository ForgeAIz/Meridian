// ─── AllocationPie ──────────────────────────────────────────────────────────
// Pie chart showing category allocation (assets or liabilities).
// Assets use brass tones, liabilities use teal tones.

"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { CategoryAllocation } from "@/lib/types";

interface AllocationPieProps {
  data: CategoryAllocation[];
  title: string;
  total: number;
  type: "asset" | "liability";
  onSliceClick?: (category: string) => void;
}

function formatCurrency(value: number, currency: string): string {
  const symbols: Record<string, string> = { USD: "$", GBP: "£", EUR: "€", AUD: "A$", CAD: "C$" };
  const symbol = symbols[currency] ?? currency + " ";
  const abs = Math.abs(value);
  return (value < 0 ? "-" : "") + symbol + abs.toLocaleString("en-US", { minimumFractionDigits: 0 });
}

// Brass-toned palette for assets, teal-toned for liabilities
const ASSET_COLORS = ["#A9813C", "#C4A265", "#8B6B2E", "#D4B98A", "#6F5524", "#E8D4B0"];
const LIABILITY_COLORS = ["#2B4A48", "#4A6F6C", "#1D3432", "#6B8F8C", "#122220", "#8DADAA"];

function CustomTooltip(props: Record<string, unknown>) {
  const { active, payload } = props as {
    active: boolean;
    payload?: Array<{ payload: CategoryAllocation }>;
  };
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload;
  return (
    <div className="rounded border border-slate/20 bg-white px-3 py-2 text-sm shadow-sm">
      <p className="text-xs text-slate">{entry.category}</p>
      <p className="font-mono text-xs text-ink">
        {entry.percent.toFixed(1)}% — {formatCurrency(entry.total, "GBP")}
      </p>
    </div>
  );
}

export default function AllocationPie({ data, title, total, type, onSliceClick }: AllocationPieProps) {
  const colors = type === "asset" ? ASSET_COLORS : LIABILITY_COLORS;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-ink">{title}</p>

      {data.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded bg-slate/5">
          <p className="text-xs text-slate/50">No data</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start">
          <div className="h-40 w-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={65}
                  dataKey="total"
                  nameKey="category"
                  strokeWidth={0}
                  onClick={onSliceClick ? (_data: any, _index: number) => {
                    const name = _data?.name ?? _data?.payload?.category;
                    if (name) onSliceClick(name);
                  } : undefined}
                  style={onSliceClick ? { cursor: "pointer" } : undefined}
                >
                  {data.map((entry, i) => (
                    <Cell key={entry.category} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="space-y-1 text-xs">
            {data.map((entry, i) => (
              <div key={entry.category} className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: colors[i % colors.length] }}
                />
                <span className="text-slate">{entry.category}</span>
                <span className="font-mono text-ink">{entry.percent.toFixed(1)}%</span>
              </div>
            ))}
            <div className="pt-1 text-xs text-slate/60">
              Total: {formatCurrency(total, "GBP")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
