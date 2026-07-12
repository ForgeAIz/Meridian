// ─── Settings Page ──────────────────────────────────────────────────────────
// User preferences: base currency, theme, data export.

"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { Currency } from "@/lib/types";
import { SUPPORTED_CURRENCIES } from "@/lib/types";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [baseCurrency, setBaseCurrency] = useState<Currency>("GBP");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display text-ink">Settings</h1>
        <p className="mt-1 text-sm text-slate">
          Manage your preferences and data.
        </p>
      </div>

      {/* ─── Base Currency ──────────────────────────────────────────── */}
      <section className="rounded border border-slate/20 p-5">
        <h2 className="text-sm font-medium text-ink">Base Currency</h2>
        <p className="mt-1 text-xs text-slate">
          All totals and charts display in this currency.
        </p>
        <select
          value={baseCurrency}
          onChange={(e) => setBaseCurrency(e.target.value as Currency)}
          className="mt-3 rounded border border-slate/30 bg-white px-3 py-2 text-sm text-ink focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
        >
          {SUPPORTED_CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </section>

      {/* ─── Export ─────────────────────────────────────────────────── */}
      <section className="rounded border border-slate/20 p-5">
        <h2 className="text-sm font-medium text-ink">Export Data</h2>
        <p className="mt-1 text-xs text-slate">
          Download your snapshot history as a CSV file.
        </p>
        <button
          disabled
          className="mt-3 rounded border border-slate/30 bg-white px-4 py-2 text-sm text-slate/50"
          title="Coming soon"
        >
          Export CSV
        </button>
      </section>

      {/* ─── Account ────────────────────────────────────────────────── */}
      <section className="rounded border border-slate/20 p-5">
        <h2 className="text-sm font-medium text-ink">Account</h2>
        <p className="mt-1 text-xs text-slate">
          {user?.email ?? "Signed in"}
        </p>
        <button
          onClick={signOut}
          className="mt-3 rounded border border-clay/30 px-4 py-2 text-sm text-clay transition-colors hover:bg-clay/10"
        >
          Sign out
        </button>
      </section>
    </div>
  );
}
