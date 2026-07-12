// ─── Number Formatting Utilities ─────────────────────────────────────────────
// Consistent number/currency formatting across all Meridian components.
// Handles edge cases: NaN, Infinity, very large/small values, negative zero.

const SYMBOLS: Record<string, string> = {
  USD: "$",
  GBP: "\u00a3",
  EUR: "\u20ac",
  AUD: "A$",
  CAD: "C$",
};

/**
 * Formats a number as a currency string with the appropriate symbol.
 * Handles NaN, Infinity, and negative zero gracefully.
 *
 * @param value - The numeric value to format
 * @param currency - The currency code (USD, GBP, EUR, AUD, CAD)
 * @param options - Formatting options
 * @returns A formatted currency string like "£130,500" or "-$5,000.00"
 */
export function formatCurrency(
  value: number,
  currency: string = "GBP",
  options?: { decimals?: number; compact?: boolean }
): string {
  // Edge case: NaN or Infinity
  if (!isFinite(value)) {
    return `${SYMBOLS[currency] ?? currency}0`;
  }

  const symbol = SYMBOLS[currency] ?? currency + " ";
  const abs = Math.abs(value);
  const decimals = options?.decimals ?? (abs < 1 ? 2 : abs < 100 ? 1 : 0);

  let formatted: string;

  if (options?.compact && abs >= 1000000) {
    const millions = abs / 1000000;
    formatted = millions.toFixed(1).replace(/\.0$/, "") + "M";
  } else if (options?.compact && abs >= 1000) {
    const thousands = abs / 1000;
    formatted = thousands.toFixed(1).replace(/\.0$/, "") + "k";
  } else {
    formatted = abs.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  // Handle negative zero
  const isNegative = value < 0 || (Object.is(value, -0));
  return (isNegative ? "-" : "") + symbol + formatted;
}

/**
 * Formats a number as a compact currency string for chart axes.
 */
export function formatChartAxis(value: number, currency: string = "GBP"): string {
  return formatCurrency(value, currency, { compact: true });
}

/**
 * Formats a percentage value with sign.
 */
export function formatPercent(value: number): string {
  if (!isFinite(value)) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}
