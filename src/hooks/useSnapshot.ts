// ─── useSnapshot Hook ───────────────────────────────────────────────────────
// React Query wrapper around the current DRAFT snapshot.
// Handles fetching the current month's snapshot (creating via prefill if needed),
// and upserting on save/lock.

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSnapshotByMonth,
  fetchLatestLockedSnapshot,
  upsertSnapshot,
} from "@/lib/supabase/queries";
import { prefillSnapshot } from "@/lib/engines/lockEngine";
import { lockSnapshot as lockEngineSnapshot } from "@/lib/engines/lockEngine";
import type { Snapshot, Currency, FxRates } from "@/lib/types";

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

interface UseSnapshotOptions {
  userId: string;
  baseCurrency: Currency;
  month?: string;
}

export function useSnapshot({ userId, baseCurrency, month }: UseSnapshotOptions) {
  const targetMonth = month ?? getCurrentMonth();
  const queryClient = useQueryClient();

  // ─── Fetch the DRAFT snapshot (or create if it doesn't exist) ───────

  const {
    data: snapshot,
    isLoading,
    error,
    refetch,
  } = useQuery<Snapshot>({
    queryKey: ["snapshot", userId, targetMonth],
    queryFn: async () => {
      // Try to fetch existing snapshot for this month
      const existing = await fetchSnapshotByMonth(userId, targetMonth);

      if (existing) {
        return existing;
      }

      // No snapshot yet — prefill from prior month
      const prior = await fetchLatestLockedSnapshot(userId, targetMonth);
      return prefillSnapshot(userId, targetMonth, prior, baseCurrency);
    },
    staleTime: 0, // Always refetch after lock
    enabled: !!userId,
  });

  // ─── Upsert mutation (save draft, no lock) ─────────────────────────

  const saveMutation = useMutation({
    mutationFn: async (updatedSnapshot: Snapshot) => {
      await upsertSnapshot(updatedSnapshot);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["snapshot", userId, targetMonth] });
    },
  });

  // ─── Lock mutation ─────────────────────────────────────────────────

  const lockMutation = useMutation({
    mutationFn: async ({
      snapshot,
      fxRates,
    }: {
      snapshot: Snapshot;
      fxRates: FxRates;
    }) => {
      const locked = lockEngineSnapshot(snapshot, fxRates);
      await upsertSnapshot(locked);
    },
    onSuccess: () => {
      // Invalidate both the snapshot and all dashboard data
      queryClient.invalidateQueries({ queryKey: ["snapshot", userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
    },
  });

  return {
    snapshot,
    isLoading,
    error,
    refetch,
    saveMutation,
    lockMutation,
    targetMonth,
  };
}
