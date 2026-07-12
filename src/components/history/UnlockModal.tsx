// ─── UnlockModal ────────────────────────────────────────────────────────────
// Confirmation modal before unlocking a locked snapshot.
// Warns the user about downstream effects before allowing the action.

"use client";

interface UnlockModalProps {
  month: string;
  onConfirm: () => void;
  onCancel: () => void;
  isUnlocking: boolean;
}

export default function UnlockModal({
  month,
  onConfirm,
  onCancel,
  isUnlocking,
}: UnlockModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-t-xl bg-paper p-6 shadow-lg sm:rounded-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-clay/10">
            <svg className="h-5 w-5 text-clay" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-ink">Unlock {month}?</h3>
            <p className="text-xs text-slate mt-0.5">
              This snapshot is currently locked and read-only.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-md border border-clay/20 bg-clay/5 px-4 py-3">
          <p className="text-xs text-clay">
            Unlocking will let you edit this month&apos;s entries. All charts,
            ratios, and goal projections from {month} onward will recalculate
            when you re-lock.
          </p>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onConfirm}
            disabled={isUnlocking}
            className="flex-1 rounded-md bg-clay px-4 py-2 text-sm text-white transition-colors hover:bg-clay/90 disabled:opacity-50"
          >
            {isUnlocking ? "Unlocking…" : "Unlock & edit"}
          </button>
          <button
            onClick={onCancel}
            disabled={isUnlocking}
            className="flex-1 rounded-md border border-slate/20 bg-white px-4 py-2 text-sm text-slate transition-colors hover:bg-slate/5 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
