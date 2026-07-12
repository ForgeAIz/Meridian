// ─── Settings Page ──────────────────────────────────────────────────────────
// User preferences: base currency, theme, data export.

"use client";

import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import { SUPPORTED_CURRENCIES } from "@/lib/types";
import type { Currency } from "@/lib/types";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { settings, baseCurrency, isLoading, updateMutation } = useSettings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate/30 border-t-brass" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-ink">Settings</h1>
        <p className="mt-1 text-sm text-slate">
          Manage your preferences and data.
        </p>
      </div>

      {/* ─── Base Currency ──────────────────────────────────────────── */}
      <section className="rounded border border-slate/20 p-5">
        <h2 className="text-sm font-medium text-ink">Base Currency</h2>
        <p className="mt-1 text-xs text-slate">
          All totals and charts display in this currency. Historical snapshots
          use their locked-in exchange rates.
        </p>
        <select
          value={baseCurrency}
          onChange={(e) =>
            updateMutation.mutate({ baseCurrency: e.target.value as Currency })
          }
          disabled={updateMutation.isPending}
          className="mt-3 rounded border border-slate/30 bg-white px-3 py-2 text-sm text-ink focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass disabled:opacity-50"
        >
          {SUPPORTED_CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {updateMutation.isPending && (
          <span className="ml-2 text-xs text-slate">Saving…</span>
        )}
      </section>

      {/* ─── Theme ──────────────────────────────────────────────────── */}
      <section className="rounded border border-slate/20 p-5">
        <h2 className="text-sm font-medium text-ink">Theme</h2>
        <p className="mt-1 text-xs text-slate">
          Choose your preferred appearance.
        </p>
        <select
          value={settings?.theme ?? "light"}
          onChange={(e) =>
            updateMutation.mutate({ theme: e.target.value as "light" | "dark" })
          }
          disabled={updateMutation.isPending}
          className="mt-3 rounded border border-slate/30 bg-white px-3 py-2 text-sm text-ink focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass disabled:opacity-50"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </section>

      {/* ─── Month Start Prefill ────────────────────────────────────── */}
      <section className="rounded border border-slate/20 p-5">
        <h2 className="text-sm font-medium text-ink">Monthly Prefill</h2>
        <p className="mt-1 text-xs text-slate">
          Auto-fill new months with the previous month&apos;s entries.
        </p>
        <label className="mt-3 flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings?.monthStartPrefill ?? true}
            onChange={(e) =>
              updateMutation.mutate({ monthStartPrefill: e.target.checked })
            }
            disabled={updateMutation.isPending}
            className="h-4 w-4 rounded border-slate/30 text-brass focus:ring-brass"
          />
          <span className="text-sm text-ink">Enable prefill</span>
        </label>
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
