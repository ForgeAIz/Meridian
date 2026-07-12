// ─── TrueEquityCard ─────────────────────────────────────────────────────────
// Shows true equity for property-mortgage linked pairs.
// Only appears when a liability has linkedAssetId pointing to an asset.

"use client";

import type { Snapshot } from "@/lib/types";

interface TrueEquityCardProps {
  latestSnapshot: Snapshot | null;
}

function formatCurrency(value: number, currency: string): string {
  const symbols: Record<string, string> = { USD: "$", GBP: "\u00a3", EUR: "\u20ac", AUD: "A$", CAD: "C$" };
  const symbol = symbols[currency] ?? currency + " ";
  const abs = Math.abs(value);
  return (value < 0 ? "-" : "") + symbol + abs.toLocaleString("en-US", { minimumFractionDigits: 0 });
}

export default function TrueEquityCard({ latestSnapshot }: TrueEquityCardProps) {
  if (!latestSnapshot) return null;

  // Find linked pairs: liabilities that reference an asset via linkedAssetId
  const linkedPairs: { asset: typeof latestSnapshot.assets[0]; liability: typeof latestSnapshot.liabilities[0] }[] = [];

  for (const liability of latestSnapshot.liabilities) {
    if (!liability.linkedAssetId) continue;
    const asset = latestSnapshot.assets.find((a) => a.id === liability.linkedAssetId);
    if (asset) {
      linkedPairs.push({ asset, liability });
    }
  }

  if (linkedPairs.length === 0) return null;

  const currency = latestSnapshot.baseCurrency;

  return (
    <div className="rounded border border-slate/20 p-5 chart-card space-y-3">
      <p className="text-sm font-medium text-ink">True Equity</p>

      {linkedPairs.map((pair, i) => {
        const equity = pair.asset.valueInBaseCurrency - pair.liability.valueInBaseCurrency;
        const ltv = (pair.liability.valueInBaseCurrency / pair.asset.valueInBaseCurrency) * 100;

        return (
          <div key={i} className="space-y-2">
            <p className="text-xs text-slate">{pair.asset.name}</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] text-deep-teal">Property</p>
                <p className="font-mono text-xs font-medium text-deep-teal">
                  {formatCurrency(pair.asset.valueInBaseCurrency, currency)}
                </p>
              </div>
              <div className="border-x border-slate/10 px-2">
                <p className="text-[10px] text-clay">Mortgage</p>
                <p className="font-mono text-xs font-medium text-clay">
                  {formatCurrency(pair.liability.valueInBaseCurrency, currency)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-brass">Equity</p>
                <p className="font-mono text-xs font-medium text-brass">
                  {formatCurrency(equity, currency)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate">
              <div className="h-1.5 flex-1 rounded-full bg-slate/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-brass"
                  style={{ width: `${Math.min(ltv, 100)}%` }}
                />
              </div>
              <span>LTV {ltv.toFixed(0)}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
