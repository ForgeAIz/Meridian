// ─── RefreshAllPricesButton ──────────────────────────────────────────────────
// Top-level button in the entry form: fetches prices for all entries with tickers.
// Only visible in draft mode when at least one ticker exists.

"use client";

import { useState } from "react";
import { fetchMarketPrice } from "@/lib/marketPrice";
import type { AssetEntry, LiabilityEntry } from "@/lib/types";

interface RefreshAllPricesButtonProps {
  assets: AssetEntry[];
  liabilities: LiabilityEntry[];
  onPriceFetched: (type: "asset" | "liability", id: string, price: number, currency?: string) => void;
}

export default function RefreshAllPricesButton({
  assets,
  liabilities,
  onPriceFetched,
}: RefreshAllPricesButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  const entriesWithTickers = [
    ...assets.filter((a) => a.ticker?.trim()).map((a) => ({ type: "asset" as const, entry: a })),
    ...liabilities.filter((l) => l.ticker?.trim()).map((l) => ({ type: "liability" as const, entry: l })),
  ];

  if (entriesWithTickers.length === 0) return null;

  async function handleRefreshAll() {
    setLoading(true);
    setResult(null);

    let success = 0;
    let failed = 0;

    for (const { type, entry } of entriesWithTickers) {
      const ticker = entry.ticker!.trim();
      if (!ticker) continue;

      const res = await fetchMarketPrice(ticker);
      if (res.success && res.price !== undefined) {
        onPriceFetched(type, entry.id, res.price, res.currency);
        success++;
      } else {
        failed++;
      }
    }

    setResult({ success, failed });
    setLoading(false);

    // Clear result after 5 seconds
    setTimeout(() => setResult(null), 5000);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleRefreshAll}
        disabled={loading}
        className="flex items-center gap-1.5 rounded border border-slate/20 bg-white px-3 py-1.5 text-xs text-slate transition-colors hover:bg-slate/5 disabled:opacity-50"
      >
        {loading ? (
          <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
        )}
        Refresh All Prices ({entriesWithTickers.length})
      </button>

      {result && (
        <span className={`text-xs ${result.failed > 0 ? "text-clay" : "text-signal-sage"}`}>
          {result.success > 0 && `${result.success} updated`}
          {result.success > 0 && result.failed > 0 && ", "}
          {result.failed > 0 && `${result.failed} failed`}
        </span>
      )}
    </div>
  );
}
