// ─── SnapshotDetail ─────────────────────────────────────────────────────────
// Read-only view of a locked snapshot's entries with an unlock option.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Snapshot } from "@/lib/types";
import UnlockModal from "./UnlockModal";

interface SnapshotDetailProps {
  snapshot: Snapshot;
  onUnlock: (snapshot: Snapshot) => Promise<string>;
}

function formatCurrency(value: number, currency: string): string {
  const symbols: Record<string, string> = { USD: "$", GBP: "£", EUR: "€", AUD: "A$", CAD: "C$" };
  const symbol = symbols[currency] ?? currency + " ";
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (value < 0 ? "-" : "") + symbol + formatted;
}

export default function SnapshotDetail({
  snapshot,
  onUnlock,
}: SnapshotDetailProps) {
  const router = useRouter();
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  async function handleConfirmUnlock() {
    setIsUnlocking(true);
    try {
      const month = await onUnlock(snapshot);
      router.push(`/entry?month=${month}`);
    } catch {
      setIsUnlocking(false);
      setShowUnlockModal(false);
    }
  }

  const isLocked = snapshot.status === "locked";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl text-ink">{snapshot.month}</h2>
          <p className="mt-0.5 text-xs text-slate">
            {isLocked
              ? `Locked on ${snapshot.lockedAt ? new Date(snapshot.lockedAt).toLocaleDateString() : "—"}`
              : "Draft"}
          </p>
        </div>
        {isLocked && (
          <button
            onClick={() => setShowUnlockModal(true)}
            className="rounded-md border border-slate/20 bg-white px-3 py-1.5 text-xs text-slate transition-colors hover:border-clay/30 hover:text-clay"
          >
            Unlock to edit
          </button>
        )}
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-md border border-slate/10 bg-white p-3 text-center">
          <p className="text-xs text-deep-teal">Assets</p>
          <p className="mt-1 font-mono text-sm font-medium text-deep-teal">
            {formatCurrency(snapshot.totalAssets, snapshot.baseCurrency)}
          </p>
        </div>
        <div className="rounded-md border border-slate/10 bg-white p-3 text-center">
          <p className="text-xs text-clay">Liabilities</p>
          <p className="mt-1 font-mono text-sm font-medium text-clay">
            {formatCurrency(snapshot.totalLiabilities, snapshot.baseCurrency)}
          </p>
        </div>
        <div className="rounded-md border border-slate/10 bg-white p-3 text-center">
          <p className="text-xs text-ink">Net Worth</p>
          <p
            className={`mt-1 font-mono text-sm font-semibold ${
              snapshot.netWorth >= 0 ? "text-brass" : "text-clay"
            }`}
          >
            {formatCurrency(snapshot.netWorth, snapshot.baseCurrency)}
          </p>
        </div>
      </div>

      {/* Assets */}
      {snapshot.assets.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-deep-teal uppercase tracking-wider">
            Assets
          </p>
          {snapshot.assets.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-md border border-slate/10 bg-white px-4 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-ink">{entry.name}</span>
                <span className="rounded bg-slate/5 px-1.5 py-0.5 text-[10px] text-slate">
                  {entry.category}
                </span>
              </div>
              <div className="text-right font-mono text-sm text-ink">
                {formatCurrency(entry.valueInBaseCurrency, snapshot.baseCurrency)}
                <span className="ml-1 text-[10px] text-slate/40">{entry.currency}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Liabilities */}
      {snapshot.liabilities.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-clay uppercase tracking-wider">
            Liabilities
          </p>
          {snapshot.liabilities.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-md border border-slate/10 bg-white px-4 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-ink">{entry.name}</span>
                <span className="rounded bg-slate/5 px-1.5 py-0.5 text-[10px] text-slate">
                  {entry.category}
                </span>
              </div>
              <div className="text-right font-mono text-sm text-ink">
                {formatCurrency(entry.valueInBaseCurrency, snapshot.baseCurrency)}
                <span className="ml-1 text-[10px] text-slate/40">{entry.currency}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      {snapshot.notes && (
        <div className="rounded-md bg-slate/5 px-4 py-2.5">
          <p className="text-xs text-slate">Notes</p>
          <p className="mt-0.5 text-sm text-ink italic">{snapshot.notes}</p>
        </div>
      )}

      {/* FX Rates */}
      {snapshot.fxRatesUsed && (
        <div className="rounded-md bg-slate/5 px-4 py-2.5">
          <p className="text-xs text-slate">FX rates used at lock time</p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-slate/60">
            {Object.entries(snapshot.fxRatesUsed).map(([currency, rate]) => (
              <span key={currency}>
                1 {snapshot.baseCurrency} = {rate} {currency}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Unlock Modal */}
      {showUnlockModal && (
        <UnlockModal
          month={snapshot.month}
          onConfirm={handleConfirmUnlock}
          onCancel={() => setShowUnlockModal(false)}
          isUnlocking={isUnlocking}
        />
      )}
    </div>
  );
}
