// ─── History Page ───────────────────────────────────────────────────────────
// View all past snapshots, inspect details, and unlock for re-editing.

"use client";

import { useState } from "react";
import { useHistory } from "@/hooks/useHistory";
import SnapshotList from "@/components/history/SnapshotList";
import SnapshotDetail from "@/components/history/SnapshotDetail";
import type { Snapshot } from "@/lib/types";

export default function HistoryPage() {
  const { snapshots, isLoading, error, handleUnlock } = useHistory();
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);

  // ─── Loading ───────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate/30 border-t-brass" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 rounded border border-clay/30 bg-clay/10 px-6 py-12 text-center">
        <p className="text-sm text-clay">Failed to load snapshot history.</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded border border-slate/30 bg-white px-4 py-2 text-sm text-ink"
        >
          Try again
        </button>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">History</h1>
        <p className="mt-1 text-sm text-slate">
          View and manage your past monthly snapshots.
        </p>
      </div>

      {snapshots.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded border border-dashed border-slate/30 px-6 py-16 text-center">
          <div className="rounded-full bg-brass/10 p-4">
            <svg className="h-8 w-8 text-brass" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-ink">No snapshots yet</h2>
          <p className="max-w-sm text-sm text-slate">
            Your monthly snapshots will appear here once you start recording.
            Each snapshot shows a frozen record of your financial position.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-5">
          {/* Sidebar — snapshot list */}
          <div className="md:col-span-2">
            <SnapshotList
              snapshots={snapshots}
              selectedId={selectedSnapshot?.id}
              onSelect={setSelectedSnapshot}
            />
          </div>

          {/* Detail panel */}
          <div className="md:col-span-3">
            {selectedSnapshot ? (
              <SnapshotDetail
                snapshot={selectedSnapshot}
                onUnlock={handleUnlock}
              />
            ) : (
              <div className="flex h-full min-h-[200px] items-center justify-center rounded-md border border-dashed border-slate/20">
                <p className="text-sm text-slate/50">
                  Select a snapshot to view details
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
