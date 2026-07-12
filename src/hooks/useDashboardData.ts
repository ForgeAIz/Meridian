// ─── useDashboardData Hook ───────────────────────────────────────────────────
// Fetches all locked snapshots and runs the aggregation engine to produce
// all dashboard data. Cached via React Query, invalidated when a new
// snapshot is locked.

"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { fetchAllLockedSnapshots, fetchSettings, fetchGoals } from "@/lib/supabase/queries";
import {
  netWorthSeries,
  leverageRatioSeries,
  categoryAllocation,
  momChange,
  assetsVsLiabilitiesSeries,
  leverageTrendLabel,
} from "@/lib/engines/aggregationEngine";
import { projectGoal } from "@/lib/engines/projectionEngine";
import type {
  NetWorthPoint,
  LeveragePoint,
  CategoryAllocation,
  MomChangeResult,
  TrendLabel,
  GoalProjection,
  Snapshot,
  Goal,
  Settings,
} from "@/lib/types";

export interface DashboardData {
  snapshots: Snapshot[];
  netWorthSeries: NetWorthPoint[];
  leverageSeries: LeveragePoint[];
  leverageTrend: TrendLabel;
  assetsVsLiabilities: {
    assets: NetWorthPoint[];
    liabilities: NetWorthPoint[];
  };
  latestAllocations: {
    assets: CategoryAllocation[];
    liabilities: CategoryAllocation[];
  };
  latestMoM: MomChangeResult | null;
  latestSnapshot: Snapshot | null;
  goals: Goal[];
  goalProjections: Map<string, GoalProjection>;
  settings: Settings | null;
  snapshotCount: number;
}

export function useDashboardData() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? "";

  return useQuery<DashboardData>({
    queryKey: ["dashboard", userId],
    queryFn: async () => {
      const [snapshots, settings, goals] = await Promise.all([
        fetchAllLockedSnapshots(userId),
        fetchSettings(userId),
        fetchGoals(userId),
      ]);

      const nwSeries = netWorthSeries(snapshots);
      const levSeries = leverageRatioSeries(snapshots);
      const levTrend = leverageTrendLabel(levSeries);
      const avlSeries = assetsVsLiabilitiesSeries(snapshots);

      // Latest snapshot for allocations and MoM
      const latest = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;

      const latestAllocations = {
        assets: latest ? categoryAllocation(latest.assets, latest.totalAssets) : [],
        liabilities: latest ? categoryAllocation(latest.liabilities, latest.totalLiabilities) : [],
      };

      const latestMoM = latest ? momChange(snapshots, latest.month) : null;

      // Goal projections
      const goalProjections = new Map<string, GoalProjection>();
      for (const goal of goals) {
        goalProjections.set(goal.id, projectGoal(snapshots, goal));
      }

      return {
        snapshots,
        netWorthSeries: nwSeries,
        leverageSeries: levSeries,
        leverageTrend: levTrend,
        assetsVsLiabilities: avlSeries,
        latestAllocations,
        latestMoM,
        latestSnapshot: latest,
        goals,
        goalProjections,
        settings,
        snapshotCount: snapshots.length,
      };
    },
    enabled: !authLoading && !!userId,
    staleTime: 30 * 1000,
  });
}
