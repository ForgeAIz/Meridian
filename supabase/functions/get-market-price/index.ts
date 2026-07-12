// ─── Supabase Edge Function: get-market-price ───────────────────────────────
// Fetches current market price for a given ticker from Yahoo Finance.
// Caches results for 10 minutes per ticker.
// Deno runtime (Supabase Edge Functions).

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface CacheEntry {
  price: number;
  currency: string;
  timestamp: string;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const { ticker } = await req.json();

    if (!ticker || typeof ticker !== "string") {
      return new Response(JSON.stringify({ success: false, error: "Missing or invalid ticker" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const cleanTicker = ticker.trim().toUpperCase();
    if (!cleanTicker) {
      return new Response(JSON.stringify({ success: false, error: "Empty ticker" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Check cache
    const cached = cache.get(cleanTicker);
    if (cached && Date.now() < cached.expiresAt) {
      return new Response(JSON.stringify({
        success: true,
        price: cached.price,
        currency: cached.currency,
        timestamp: cached.timestamp,
        cached: true,
      }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Fetch from Yahoo Finance
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(cleanTicker)}?interval=1d&range=1d`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return new Response(JSON.stringify({ success: false, error: `Ticker "${cleanTicker}" not found` }), {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Yahoo API responded with ${response.status}`);
    }

    const data = await response.json();

    // Parse the response
    const result = data?.chart?.result?.[0];
    if (!result) {
      return new Response(JSON.stringify({ success: false, error: `No data available for "${cleanTicker}"` }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const meta = result.meta;
    const quote = result.indicators?.quote?.[0];
    const close = quote?.close?.filter((v: number | null) => v !== null);
    const latestPrice = close?.[close.length - 1] ?? meta?.regularMarketPrice ?? meta?.previousClose;

    if (latestPrice === undefined || latestPrice === null) {
      return new Response(JSON.stringify({ success: false, error: `No price data for "${cleanTicker}"` }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Determine currency
    let currency = meta?.currency ?? "USD";
    // Map Yahoo currency codes
    const currencyMap: Record<string, string> = {
      "GBp": "GBP",
      "EUR": "EUR",
      "USD": "USD",
      "AUD": "AUD",
      "CAD": "CAD",
      "GBP": "GBP",
    };
    currency = currencyMap[currency] ?? currency;

    const timestamp = new Date().toISOString();
    const expiry = Date.now() + CACHE_TTL_MS;

    // Cache it
    cache.set(cleanTicker, {
      price: latestPrice,
      currency,
      timestamp,
      expiresAt: expiry,
    });

    return new Response(JSON.stringify({
      success: true,
      price: latestPrice,
      currency,
      timestamp,
      cached: false,
    }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("get-market-price error:", err);
    return new Response(JSON.stringify({
      success: false,
      error: "Market data temporarily unavailable — enter manually",
    }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
