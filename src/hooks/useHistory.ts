// ─── useHistory Hook ─────────────────────────────────────────────────────────
// Fetches all snapshots (draft + locked) for history view.

"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { upsertSnapshot } from "@/lib/supabase/queries";
import { unlockSnapshot } from "@/lib/engines/lockEngine";
import type { Snapshot, Currency, FxRates, SnapshotStatus } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapRowToSnapshot(row: Record<string, any>): Snapshot {
  return {
    id: row.id,
    userId: row.user_id,
    month: row.month,
    status: row.status as SnapshotStatus,
    baseCurrency: row.base_currency as Currency,
    fxRatesUsed: row.fx_rates_used as FxRates | null,
    assets: [],
    liabilities: [],
    totalAssets: Number(row.total_assets),
    totalLiabilities: Number(row.total_liabilities),
    netWorth: Number(row.net_worth),
    lockedAt: row.locked_at,
  };
}

function mapAssetEntry(row: Record<string, any>) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    currency: row.currency as Currency,
    value: Number(row.value),
    valueInBaseCurrency: Number(row.value_in_base_currency),
  };
}

function mapLiabilityEntry(row: Record<string, any>) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    currency: row.currency as Currency,
    value: Number(row.value),
    valueInBaseCurrency: Number(row.value_in_base_currency),
    linkedAssetId: row.linked_asset_id ?? undefined,
  };
}

export function useHistory() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? "";
  const queryClient = useQueryClient();

  const {
    data: snapshots = [],
    isLoading,
    error,
  } = useQuery<Snapshot[]>({
    queryKey: ["history", userId],
    queryFn: async () => {
      const supabase = createClient();

      const { data: snapRows } = await supabase
        .from("snapshots")
        .select("*")
        .eq("user_id", userId)
        .order("month", { ascending: false });

      if (!snapRows || snapRows.length === 0) return [];

      const snapIds = snapRows.map((r: any) => r.id);

      const [assetRes, liabilityRes] = await Promise.all([
        supabase.from("asset_entries").select("*").in("snapshot_id", snapIds),
        supabase.from("liability_entries").select("*").in("snapshot_id", snapIds),
      ]);

      const assetMap = new Map<string, ReturnType<typeof mapAssetEntry>[]>();
      for (const row of assetRes.data ?? []) {
        const list = assetMap.get(row.snapshot_id) ?? ([] as ReturnType<typeof mapAssetEntry>[]);
        list.push(mapAssetEntry(row));
        assetMap.set(row.snapshot_id, list);
      }

      const liabilityMap = new Map<string, ReturnType<typeof mapLiabilityEntry>[]>();
      for (const row of liabilityRes.data ?? []) {
        const list = liabilityMap.get(row.snapshot_id) ?? ([] as ReturnType<typeof mapLiabilityEntry>[]);
        list.push(mapLiabilityEntry(row));
        liabilityMap.set(row.snapshot_id, list);
      }

      return snapRows.map((row: any) => {
        const snap = mapRowToSnapshot(row);
        snap.assets = assetMap.get(snap.id) ?? [];
        snap.liabilities = liabilityMap.get(snap.id) ?? [];
        return snap;
      });
    },
    enabled: !authLoading && !!userId,
  });

  async function handleUnlock(snapshot: Snapshot): Promise<string> {
    const unlocked = unlockSnapshot(snapshot);
    unlocked.fxRatesUsed = null;
    unlocked.lockedAt = null;
    await upsertSnapshot(unlocked);
    queryClient.invalidateQueries({ queryKey: ["history", userId] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", userId] });
    queryClient.invalidateQueries({ queryKey: ["snapshot", userId] });
    return unlocked.month;
  }

  return {
    snapshots,
    isLoading,
    error,
    handleUnlock,
  };
}
