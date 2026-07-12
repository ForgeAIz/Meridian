// ─── FX Rates Utility ───────────────────────────────────────────────────────
// Fetches current exchange rates. Falls back to cached rates if the API is down.
// In production, replace with a real FX API (e.g. exchangerate-api.com, Open Exchange Rates).

import type { Currency, FxRates } from "@/lib/types";

// Approximate rates as of mid-2026 (hardcoded for development).
// These will be replaced with a live API in production.
const DEFAULT_RATES: FxRates = {
  USD: 1.0,
  GBP: 0.79,
  EUR: 0.92,
  AUD: 1.52,
  CAD: 1.36,
};

// Cache for the most recent rates
let cachedRates: FxRates | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetches current FX rates from the default provider perspective (USD-based).
 * Returns rates where USD = 1.0 and all others are relative.
 *
 * Falls back to the last cached rates (or default rates) if the fetch fails.
 */
export async function fetchFxRates(): Promise<FxRates> {
  // Check cache first
  if (cachedRates && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedRates;
  }

  try {
    // Try to fetch live rates
    // TODO: Replace with actual FX API endpoint
    // const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    // const data = await res.json();
    // const fetched: FxRates = {
    //   USD: 1.0,
    //   GBP: data.rates.GBP,
    //   EUR: data.rates.EUR,
    //   AUD: data.rates.AUD,
    //   CAD: data.rates.CAD,
    // };

    throw new Error("FX API not configured"); // Using defaults for now
  } catch {
    // Fall back to cache or defaults
    if (cachedRates) {
      return cachedRates;
    }
    return { ...DEFAULT_RATES };
  }
}

/**
 * Fetches rates and caches them. Called at snapshot lock time.
 */
export async function fetchAndCacheFxRates(): Promise<FxRates> {
  const rates = await fetchFxRates();
  cachedRates = rates;
  cacheTimestamp = Date.now();
  return rates;
}

/**
 * Converts rates so the given baseCurrency is 1.0.
 * The engine expects rates where baseCurrency = 1.0.
 */
export function normalizeRates(rates: FxRates, baseCurrency: Currency): FxRates {
  const baseRate = rates[baseCurrency] ?? 1;
  const normalized: Record<string, number> = {};
  for (const [currency, rate] of Object.entries(rates)) {
    normalized[currency] = rate / baseRate;
  }
  return normalized as FxRates;
}

export function getDefaultRate(currency: Currency): number {
  return DEFAULT_RATES[currency] ?? 1;
}
