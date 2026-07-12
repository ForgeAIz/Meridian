// ─── LiabilitySection ────────────────────────────────────────────────────────
// Manages the list of liability entry rows with add/delete and staggered animation.

"use client";

import EntryRow from "./EntryRow";
import type { LiabilityEntry } from "@/lib/types";

interface LiabilitySectionProps {
  liabilities: LiabilityEntry[];
  onUpdate: (id: string, field: string, value: string | number) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  removingIds: Set<string>;
  isDraft: boolean;
}

export default function LiabilitySection({
  liabilities,
  onUpdate,
  onDelete,
  onAdd,
  removingIds,
  isDraft,
}: LiabilitySectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-ink">Liabilities</h2>
        <span className="text-xs text-clay">
          {liabilities.length} {liabilities.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {liabilities.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate/30 px-4 py-8 text-center">
          <p className="text-sm text-slate">
            What do you owe? Leave this blank if you&apos;re debt-free.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {liabilities.map((liability, i) => (
            <EntryRow
              key={liability.id}
              id={liability.id}
              name={liability.name}
              category={liability.category}
              currency={liability.currency}
              value={liability.value}
              valueInBaseCurrency={liability.valueInBaseCurrency}
              type="liability"
              index={i}
              ticker={liability.ticker}
              isRemoving={removingIds.has(liability.id)}
              isDraft={isDraft}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 text-sm text-clay transition-colors hover:text-clay/80 py-1"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add liability
      </button>
    </div>
  );
}
