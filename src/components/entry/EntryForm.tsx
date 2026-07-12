// ─── EntryForm ──────────────────────────────────────────────────────────────
// The core monthly entry loop: edit assets/liabilities, see live totals, lock.

"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import { useSnapshot } from "@/hooks/useSnapshot";
import { recalculateDraftTotals } from "@/lib/engines/conversionEngine";
import { fetchAndCacheFxRates } from "@/lib/fxRates";
import AssetSection from "./AssetSection";
import LiabilitySection from "./LiabilitySection";
import LiveTotalsBar from "./LiveTotalsBar";
import RefreshAllPricesButton from "./RefreshAllPricesButton";
import type { Snapshot, AssetEntry, LiabilityEntry, Currency } from "@/lib/types";

function generateId(): string {
  return crypto.randomUUID?.() ?? `e-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createEmptyAsset(): AssetEntry {
  return {
    id: generateId(),
    name: "",
    category: "Cash",
    currency: "GBP",
    value: 0,
    valueInBaseCurrency: 0,
  };
}

function createEmptyLiability(): LiabilityEntry {
  return {
    id: generateId(),
    name: "",
    category: "Mortgage",
    currency: "GBP",
    value: 0,
    valueInBaseCurrency: 0,
  };
}

const USD_RATES = {
  USD: 1.0,
  GBP: 0.79,
  EUR: 0.92,
  AUD: 1.52,
  CAD: 1.36,
};

/** Normalize USD-based rates so baseCurrency = 1.0 */
function normalizeUserRates(usdRates: Record<string, number>, base: string): Record<string, number> {
  const baseToUsd = usdRates[base] ?? 1;
  const normalized: Record<string, number> = {};
  for (const [currency, rate] of Object.entries(usdRates)) {
    normalized[currency] = rate / baseToUsd;
  }
  return normalized;
}

interface EntryFormProps {
  month?: string;
}

export default function EntryForm({ month }: EntryFormProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? "";
  const { baseCurrency: userCurrency } = useSettings();

  const {
    snapshot: initialSnapshot,
    isLoading,
    error,
    saveMutation,
    lockMutation,
    targetMonth,
  } = useSnapshot({ userId, baseCurrency: userCurrency, month });

  // Initialize local state from the query result — no effect needed
  const [localSnapshot, setLocalSnapshot] = useState<Snapshot | null>(null);
  const [prevSnapshotId, setPrevSnapshotId] = useState<string | null>(null);

  // Sync local state when a new snapshot arrives from the hook
  if (initialSnapshot && initialSnapshot.id !== prevSnapshotId) {
    setLocalSnapshot(initialSnapshot);
    setPrevSnapshotId(initialSnapshot.id);
  }

  const [lockError, setLockError] = useState<string | null>(null);
  const [isLocking, setIsLocking] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  // ─── Block future months ────────────────────────────────────────────
  const currentMonth = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  })();
  const isFutureMonth = month ? month > currentMonth : false;

  // ─── Warn before navigating away with unsaved changes (N-05) ────────
  useEffect(() => {
    if (!hasChanges) return;

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);
// ─── Recalculate totals after any edit ─────────────────────────────

const recalculate = useCallback((snap: Snapshot): Snapshot => {
  const rates = normalizeUserRates(USD_RATES, snap.baseCurrency) as import("@/lib/types").FxRates;
  return recalculateDraftTotals(snap, rates, snap.baseCurrency);
}, []);

  // ─── Update field on a row ─────────────────────────────────────────

  function handleUpdate(
    type: "asset" | "liability",
    entryId: string,
    field: string,
    value: string | number
  ) {
    if (!localSnapshot) return;

    const updated = { ...localSnapshot };
    const entries =
      type === "asset"
        ? [...updated.assets]
        : [...updated.liabilities];

    const index = entries.findIndex((e) => e.id === entryId);
    if (index === -1) return;

    const entry = { ...entries[index] } as Record<string, unknown>;

    if (field === "name") {
      entry.name = value;
    } else if (field === "category") {
      entry.category = value;
    } else if (field === "currency") {
      entry.currency = value as Currency;
    } else if (field === "value") {
      entry.value = Math.max(0, value as number);
    } else if (field === "ticker") {
      entry.ticker = value as string;
    }

    entries[index] = entry as unknown as AssetEntry & LiabilityEntry;

    if (type === "asset") {
      updated.assets = entries as AssetEntry[];
    } else {
      updated.liabilities = entries as LiabilityEntry[];
    }

    recalculate(updated);
    setLocalSnapshot(updated);
    setHasChanges(true);
  }

  // ─── Delete a row with collapse animation ──────────────────────────

  function handleDelete(type: "asset" | "liability", entryId: string) {
    // Start the collapse animation
    setRemovingIds((prev) => new Set(prev).add(entryId));

    // After animation completes, actually remove the row
    setTimeout(() => {
      if (!localSnapshot) return;

      const updated = { ...localSnapshot };
      if (type === "asset") {
        updated.assets = updated.assets.filter((a) => a.id !== entryId);
      } else {
        updated.liabilities = updated.liabilities.filter((l) => l.id !== entryId);
      }

      recalculate(updated);
      setLocalSnapshot(updated);
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(entryId);
        return next;
      });
      setHasChanges(true);
    }, 250);
  }

  // ─── Update notes ──────────────────────────────────────────────────

  function handleNotesChange(text: string) {
    if (!localSnapshot) return;
    const updated = { ...localSnapshot, notes: text };
    setLocalSnapshot(updated);
    setHasChanges(true);
  }

  // ─── Add a row ─────────────────────────────────────────────────────

  function handleAdd(type: "asset" | "liability") {
    if (!localSnapshot) return;

    const updated = { ...localSnapshot };
    if (type === "asset") {
      updated.assets = [...updated.assets, createEmptyAsset()];
    } else {
      updated.liabilities = [...updated.liabilities, createEmptyLiability()];
    }

    setLocalSnapshot(updated);
    setHasChanges(true);
  }

  // ─── Save draft (autosave) ─────────────────────────────────────────

  async function handleSave() {
    if (!localSnapshot) return;
    setLockError(null);

    try {
      await saveMutation.mutateAsync(localSnapshot);
      setHasChanges(false);
    } catch {
      setLockError("Couldn't save — check your connection and try again.");
    }
  }

  // ─── Lock snapshot ─────────────────────────────────────────────────

  async function handleLock() {
    if (!localSnapshot) return;
    setIsLocking(true);
    setLockError(null);

    try {
      // Validate: all entries with a value must have a name
      const unnamed = [
        ...localSnapshot.assets,
        ...localSnapshot.liabilities,
      ].filter((e) => e.value > 0 && !e.name.trim());

      if (unnamed.length > 0) {
        setLockError("Please name all entries that have a value.");
        setIsLocking(false);
        return;
      }

      // Fetch and freeze FX rates
      const rawRates = await fetchAndCacheFxRates();
      const normalized = normalizeUserRates(rawRates, localSnapshot.baseCurrency) as import("@/lib/types").FxRates;

      await lockMutation.mutateAsync({
        snapshot: localSnapshot,
        fxRates: normalized as import("@/lib/types").FxRates,
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: unknown) {
      setLockError(
        err instanceof Error
          ? err.message
          : "Couldn't save — check your connection and try again."
      );
    } finally {
      setIsLocking(false);
    }
  }

  // ─── Render ────────────────────────────────────────────────────────

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate/30 border-t-brass" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 rounded border border-clay/30 bg-clay/10 px-6 py-12 text-center">
        <p className="text-sm text-clay">Failed to load your snapshot.</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded border border-slate/30 bg-white px-4 py-2 text-sm text-ink"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!localSnapshot) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-slate">Loading…</p>
      </div>
    );
  }

  // ─── Block future months (N-06) ─────────────────────────────────────
  if (isFutureMonth) {
    return (
      <div className="flex flex-col items-center gap-4 rounded border border-slate/20 px-6 py-16 text-center">
        <div className="rounded-full bg-slate/10 p-4">
          <svg className="h-8 w-8 text-slate" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <h2 className="text-lg font-medium text-ink">Month not available</h2>
        <p className="max-w-sm text-sm text-slate">
          You can&apos;t create snapshots for months that haven&apos;t occurred yet.
          Future months become available on the first day of that month.
        </p>
      </div>
    );
  }

  const { assets, liabilities, totalAssets, totalLiabilities, netWorth, baseCurrency: snapshotCurrency } =
    localSnapshot;

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <div>
        <h1 className="font-display text-2xl text-ink">
          {targetMonth}
        </h1>
        <p className="text-sm text-slate">
          {localSnapshot.status === "draft"
            ? "Update your snapshot below. Changes save when you lock."
            : "This snapshot is locked."}
        </p>
      </div>

      {/* ─── Error banner ────────────────────────────────────────── */}
      {lockError && (
        <div className="rounded border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-clay">
          {lockError}
        </div>
      )}

      {/* ─── Asset Section ───────────────────────────────────────── */}
      <AssetSection
        assets={assets}
        onUpdate={(id, field, value) => handleUpdate("asset", id, field, value)}
        onDelete={(id) => handleDelete("asset", id)}
        onAdd={() => handleAdd("asset")}
        removingIds={removingIds}
        isDraft={localSnapshot.status === "draft"}
      />

      {/* ─── Divider ─────────────────────────────────────────────── */}
      <div className="h-px bg-slate/20" />

      {/* ─── Liability Section ───────────────────────────────────── */}
      <LiabilitySection
        liabilities={liabilities}
        onUpdate={(id, field, value) => handleUpdate("liability", id, field, value)}
        onDelete={(id) => handleDelete("liability", id)}
        onAdd={() => handleAdd("liability")}
        removingIds={removingIds}
        isDraft={localSnapshot.status === "draft"}
      />

      {/* ─── Notes ──────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="snapshot-notes" className="text-xs text-slate">
          Notes
        </label>
        <textarea
          id="snapshot-notes"
          value={localSnapshot.notes ?? ""}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Tax events, big life changes, market notes…"
          rows={2}
          className="mt-1 w-full rounded border border-slate/20 bg-white px-3 py-2 text-sm text-ink placeholder:text-slate/40 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass resize-none"
        />
      </div>

      {/* ─── Refresh All Prices ────────────────────────────────── */}
      {localSnapshot.status === "draft" && (
        <RefreshAllPricesButton
          assets={assets}
          liabilities={liabilities}
          onPriceFetched={(type, id, price, currency) => {
            handleUpdate(type, id, "value", price);
            if (currency) handleUpdate(type, id, "currency", currency);
          }}
        />
      )}

      {/* ─── Save / Lock Buttons ─────────────────────────────────── */}
      <div className="flex gap-3 pb-4">
        <button
          onClick={handleLock}
          disabled={isLocking || lockMutation.isPending}
          className="rounded bg-brass px-6 py-2.5 text-sm text-white transition-colors hover:bg-brass/90 disabled:opacity-50"
        >
          {isLocking || lockMutation.isPending
            ? "Saving…"
            : "Save & lock this month"}
        </button>

        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="rounded border border-slate/30 bg-white px-4 py-2.5 text-sm text-slate transition-colors hover:bg-slate/5 disabled:opacity-50"
          >
            Save draft
          </button>
        )}
      </div>

      {/* ─── Live Totals Bar ─────────────────────────────────────── */}
      <LiveTotalsBar
        totalAssets={totalAssets}
        totalLiabilities={totalLiabilities}
        netWorth={netWorth}
        baseCurrency={snapshotCurrency}
      />
    </div>
  );
}
