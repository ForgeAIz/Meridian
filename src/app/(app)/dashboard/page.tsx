// ─── Dashboard Home Page ────────────────────────────────────────────────────
// Main dashboard: net worth header, trend charts, allocation pies,
// leverage ratio, and goal cards. All wired to real data via useDashboardData.

"use client";

import Link from "next/link";
import { useDashboardData } from "@/hooks/useDashboardData";
import NetWorthHeader from "@/components/dashboard/NetWorthHeader";
import NetWorthTrendChart from "@/components/dashboard/NetWorthTrendChart";
import AssetsVsLiabilitiesChart from "@/components/dashboard/AssetsVsLiabilitiesChart";
import AllocationPie from "@/components/dashboard/AllocationPie";
import LeverageRatioCard from "@/components/dashboard/LeverageRatioCard";
import GoalCard from "@/components/dashboard/GoalCard";

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardData();

  // ─── Initial load / no auth yet ───────────────────────────────────
  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate/30 border-t-brass" />
      </div>
    );
  }

  // ─── Error state ──────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 rounded border border-clay/30 bg-clay/10 px-6 py-12 text-center">
        <p className="text-sm text-clay">Failed to load dashboard data.</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded border border-slate/30 bg-white px-4 py-2 text-sm text-ink"
        >
          Try again
        </button>
      </div>
    );
  }

    const {
    netWorthSeries: nwSeries,
    leverageSeries,
    leverageTrend,
    assetsVsLiabilities,
    latestAllocations,
    latestMoM,
    latestSnapshot,
    goals,
    goalProjections,
    snapshotCount,
  } = data!;

  const baseCurrency = latestSnapshot?.baseCurrency ?? "GBP";

  // ─── Empty state (no snapshots at all) ─────────────────────────────
  if (snapshotCount === 0) {
    return (
      <div className="space-y-6">
        <NetWorthHeader
          latestSnapshot={null}
          momChange={null}
          snapshotCount={0}
        />

        <div className="flex flex-col items-center gap-4 rounded border border-dashed border-slate/30 px-6 py-16 text-center">
          <div className="rounded-full bg-brass/10 p-4">
            <svg
              className="h-8 w-8 text-brass"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-ink">
            Start tracking your net worth
          </h2>
          <p className="max-w-sm text-sm text-slate">
            Your dashboard will show your net worth trend, asset allocation,
            leverage ratio, and goal progress — all built from your monthly
            snapshots.
          </p>
          <Link
            href="/entry"
            className="mt-2 rounded bg-brass px-5 py-2 text-sm text-white transition-colors hover:bg-brass/90"
          >
            Add your first snapshot
          </Link>
        </div>
      </div>
    );
  }

  // ─── Dashboard with data ──────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ─── Net Worth Header ──────────────────────────────────────── */}
      <NetWorthHeader
        latestSnapshot={latestSnapshot}
        momChange={latestMoM}
        snapshotCount={snapshotCount}
      />

      {/* ─── Dashboard Grid ────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Net Worth Trend (spans 2 cols on desktop) */}
        <div className="rounded border border-slate/20 p-5 chart-card md:col-span-2">
          <p className="mb-2 text-sm font-medium text-ink">Net Worth Trend</p>
          <NetWorthTrendChart data={nwSeries} currency={baseCurrency} />
        </div>

        {/* Goal Card */}
        {goals.length > 0 ? (
          <div className="rounded border border-slate/20 p-5 chart-card">
            {goals.slice(0, 1).map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                projection={goalProjections.get(goal.id) ?? {
                  status: "INSUFFICIENT_DATA",
                  avgMonthlyGrowth: null,
                  projectedDate: null,
                  monthsNeeded: null,
                  progressPercent: 0,
                }}
                latestSnapshot={latestSnapshot}
              />
            ))}
            {goals.length > 1 && (
              <Link
                href="/goals"
                className="mt-2 block text-xs text-brass hover:underline"
              >
                + {goals.length - 1} more {goals.length - 1 === 1 ? "goal" : "goals"}
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded border border-dashed border-slate/30 p-5 text-center">
            <p className="text-sm text-slate">No goals yet</p>
            <Link href="/goals" className="text-xs text-brass hover:underline">
              Set a goal
            </Link>
          </div>
        )}

        {/* Assets vs Liabilities Chart (spans 2 cols) */}
        <div className="rounded border border-slate/20 p-5 chart-card md:col-span-2">
          <p className="mb-2 text-sm font-medium text-ink">
            Assets vs Liabilities
          </p>
          <AssetsVsLiabilitiesChart
            assets={assetsVsLiabilities.assets}
            liabilities={assetsVsLiabilities.liabilities}
            currency={baseCurrency}
          />
        </div>

        {/* Leverage Ratio */}
        <div className="rounded border border-slate/20 p-5 chart-card">
          <LeverageRatioCard
            series={leverageSeries}
            trend={leverageTrend}
            latestSnapshot={
              latestSnapshot
                ? {
                    totalAssets: latestSnapshot.totalAssets,
                    totalLiabilities: latestSnapshot.totalLiabilities,
                  }
                : null
            }
          />
        </div>

        {/* Asset Allocation Pie */}
        <div className="rounded border border-slate/20 p-5 chart-card">
          <AllocationPie
            data={latestAllocations.assets}
            title="Asset Allocation"
            total={latestSnapshot?.totalAssets ?? 0}
            type="asset"
          />
        </div>

        {/* Liability Allocation Pie */}
        <div className="rounded border border-slate/20 p-5 chart-card">
          <AllocationPie
            data={latestAllocations.liabilities}
            title="Liability Allocation"
            total={latestSnapshot?.totalLiabilities ?? 0}
            type="liability"
          />
        </div>
      </div>

      {/* ─── Quick links ───────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-4 pt-2 pb-8">
        <Link
          href="/entry"
          className="flex items-center gap-1.5 text-sm text-brass hover:underline"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New entry
        </Link>
        <Link
          href="/history"
          className="flex items-center gap-1.5 text-sm text-slate hover:text-ink"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          History
        </Link>
      </div>
    </div>
  );
}
