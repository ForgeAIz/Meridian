// ─── LiveTotalsBar ───────────────────────────────────────────────────────────
// Sticky bar showing total assets, total liabilities, and net worth.
// Updates instantly as the user types.

"use client";

interface LiveTotalsBarProps {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  baseCurrency: string;
}

function formatCurrency(value: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    GBP: "£",
    EUR: "€",
    AUD: "A$",
    CAD: "C$",
  };
  const symbol = symbols[currency] ?? currency + " ";
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (value < 0 ? "-" : "") + symbol + formatted;
}

export default function LiveTotalsBar({
  totalAssets,
  totalLiabilities,
  netWorth,
  baseCurrency,
}: LiveTotalsBarProps) {
  return (
    <div className="sticky bottom-16 z-10 border-t border-slate/20 bg-paper/95 backdrop-blur-sm lg:bottom-0">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Assets */}
        <div className="text-center">
          <p className="text-xs text-deep-teal">Assets</p>
          <p className="font-mono text-sm font-medium text-deep-teal">
            {formatCurrency(totalAssets, baseCurrency)}
          </p>
        </div>

        {/* Liabilities */}
        <div className="text-center">
          <p className="text-xs text-clay">Liabilities</p>
          <p className="font-mono text-sm font-medium text-clay">
            {formatCurrency(totalLiabilities, baseCurrency)}
          </p>
        </div>

        {/* Net Worth */}
        <div className="text-center">
          <p className="text-xs text-ink">Net Worth</p>
          <p
            className={`font-mono text-base font-semibold ${
              netWorth >= 0 ? "text-brass" : "text-clay"
            }`}
          >
            {formatCurrency(netWorth, baseCurrency)}
          </p>
        </div>
      </div>
    </div>
  );
}
