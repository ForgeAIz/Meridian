// ─── NetWorthHeader ─────────────────────────────────────────────────────────
// The top of the dashboard: net worth figure (Fraunces display, count-up),
// MoM change badge, and "The Line" signature SVG element.

"use client";

import { useEffect, useState } from "react";
import type { MomChangeResult, Snapshot } from "@/lib/types";

interface NetWorthHeaderProps {
  latestSnapshot: Snapshot | null;
  momChange: MomChangeResult | null;
  snapshotCount: number;
}

function formatCurrency(value: number, currency: string): string {
  const symbols: Record<string, string> = { USD: "$", GBP: "\u00a3", EUR: "\u20ac", AUD: "A$", CAD: "C$" };
  const symbol = symbols[currency] ?? currency + " ";
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return (value < 0 ? "-" : "") + symbol + formatted;
}

export default function NetWorthHeader({
  latestSnapshot,
  momChange,
  snapshotCount,
}: NetWorthHeaderProps) {
  const targetValue = latestSnapshot?.netWorth ?? 0;
  const baseCurrency = latestSnapshot?.baseCurrency ?? "GBP";
  const [displayValue, setDisplayValue] = useState(targetValue);

  // Count-up animation via requestAnimationFrame (async, avoids sync setState lint)
  useEffect(() => {
    if (snapshotCount === 0) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const start = performance.now();
    const duration = 800;
    const startVal = 0;

    const frame = requestAnimationFrame(function animate(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(startVal + (targetValue - startVal) * eased);
      if (progress < 1) requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(frame);
  }, [targetValue, snapshotCount]);

  return (
    <div className="space-y-1">
      <p className="text-sm text-slate">
        Net Worth
        {snapshotCount > 0 && latestSnapshot && (
          <span className="ml-1 text-xs text-slate/50">
            &mdash; {latestSnapshot.month}
          </span>
        )}
      </p>

      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
        <h1
          className="font-display text-4xl tracking-tight md:text-5xl"
          style={{
            color:
              snapshotCount > 0
                ? targetValue >= 0
                  ? "var(--color-brass)"
                  : "var(--color-clay)"
                : "var(--color-ink)",
          }}
        >
          {snapshotCount > 0
            ? formatCurrency(displayValue, baseCurrency)
            : "\u2014"}
        </h1>

        {momChange && snapshotCount > 0 && (
          <span
            className={`flex items-center gap-1 text-sm font-medium ${
              momChange.delta >= 0 ? "text-signal-sage" : "text-clay"
            }`}
          >
            <svg
              className={`h-4 w-4 ${momChange.delta >= 0 ? "" : "rotate-180"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
            {momChange.delta >= 0 ? "+" : ""}
            {formatCurrency(momChange.delta, baseCurrency)}
            {momChange.percent !== null && (
              <span className="text-xs text-slate/60">
                ({momChange.delta >= 0 ? "+" : ""}
                {momChange.percent.toFixed(1)}%)
              </span>
            )}
          </span>
        )}
      </div>

      {/* The Line */}
      {snapshotCount > 0 ? (
        <svg
          className="mt-2 w-full"
          height="2"
          viewBox="0 0 1000 2"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line
            x1="0"
            y1="1"
            x2="1000"
            y2="1"
            stroke="currentColor"
            strokeWidth="1"
            className="text-brass/60 animate-line-draw"
          />
        </svg>
      ) : (
        <div className="mt-2 h-px w-full bg-slate/20" />
      )}
    </div>
  );
}
