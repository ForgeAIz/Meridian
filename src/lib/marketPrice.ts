// ─── Market Price Fetcher ────────────────────────────────────────────────────
// Client-side utility for fetching market prices from the Supabase edge function.
// Implements rate limiting: max 1 call per ticker per 30 seconds.

const RATE_LIMIT_MS = 30 * 1000; // 30 seconds
const callTimestamps = new Map<string, number>();

export interface PriceResult {
  success: boolean;
  price?: number;
  currency?: string;
  timestamp?: string;
  error?: string;
  cached?: boolean;
}

/**
 * Fetches the current market price for a ticker via the Supabase edge function.
 * Rate-limited to 1 call per ticker per 30 seconds.
 */
export async function fetchMarketPrice(ticker: string): Promise<PriceResult> {
  const cleanTicker = ticker.trim().toUpperCase();
  if (!cleanTicker) {
    return { success: false, error: "No ticker provided" };
  }

  // Rate limit check
  const lastCall = callTimestamps.get(cleanTicker);
  const now = Date.now();
  if (lastCall && now - lastCall < RATE_LIMIT_MS) {
    const remaining = Math.ceil((RATE_LIMIT_MS - (now - lastCall)) / 1000);
    return {
      success: false,
      error: `Please wait ${remaining}s before fetching ${cleanTicker} again`,
    };
  }

  // Construct the edge function URL from the Supabase URL
  // Handle both formats: with and without /rest/v1/ suffix
  let supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  const functionUrl = `${supabaseUrl}/functions/v1/get-market-price`;

  callTimestamps.set(cleanTicker, now);

  try {
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ ticker: cleanTicker }),
    });

    if (!response.ok) {
      console.error("Market price fetch failed:", response.status, response.statusText);
      return {
        success: false,
        error: `Server error (${response.status}) — enter manually`,
      };
    }

    const data: PriceResult = await response.json();
    return data;
  } catch (err) {
    console.error("Market price fetch error:", err);
    return {
      success: false,
      error: "Market data temporarily unavailable — enter manually",
    };
  }
}

/**
 * Formats a timestamp as a relative "just now" / "X min ago" string.
 */
export function formatPriceTimestamp(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}
