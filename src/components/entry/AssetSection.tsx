// ─── AssetSection ────────────────────────────────────────────────────────────
// Manages the list of asset entry rows with add/delete and staggered animation.

"use client";

import EntryRow from "./EntryRow";
import type { AssetEntry } from "@/lib/types";

interface AssetSectionProps {
  assets: AssetEntry[];
  onUpdate: (id: string, field: string, value: string | number) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  removingIds: Set<string>;
  isDraft: boolean;
}

export default function AssetSection({
  assets,
  onUpdate,
  onDelete,
  onAdd,
  removingIds,
  isDraft,
}: AssetSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-ink">Assets</h2>
        <span className="text-xs text-deep-teal">
          {assets.length} {assets.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {assets.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate/30 px-4 py-8 text-center">
          <p className="text-sm text-slate">
            What do you own? Start with your biggest asset.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {assets.map((asset, i) => (
            <EntryRow
              key={asset.id}
              id={asset.id}
              name={asset.name}
              category={asset.category}
              currency={asset.currency}
              value={asset.value}
              valueInBaseCurrency={asset.valueInBaseCurrency}
              type="asset"
              index={i}
              ticker={asset.ticker}
              isRemoving={removingIds.has(asset.id)}
              isDraft={isDraft}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 text-sm text-brass transition-colors hover:text-brass/80 py-1"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add asset
      </button>
    </div>
  );
}
