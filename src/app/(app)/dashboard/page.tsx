// ─── Dashboard Home Page ────────────────────────────────────────────────────
// Main dashboard: net worth header, trend charts, allocation pies,
// leverage ratio, goal cards, drill-down, savings rate, true equity.

"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { momChange, categoryTrend, savingsRateProxy } from "@/lib/engines/aggregationEngine";
import { adjustForInflation } from "@/lib/inflation";
import NetWorthHeader from "@/components/dashboard/NetWorthHeader";
import NetWorthTrendChart from "@/components/dashboard/NetWorthTrendChart";
import CategoryTrendChart from "@/components/dashboard/CategoryTrendChart";
import AssetsVsLiabilitiesChart from "@/components/dashboard/AssetsVsLiabilitiesChart";
import AllocationPie from "@/components/dashboard/AllocationPie";
import LeverageRatioCard from "@/components/dashboard/LeverageRatioCard";
import GoalCard from "@/components/dashboard/GoalCard";
import GapDetection from "@/components/dashboard/GapDetection";
import SavingsRateCard from "@/components/dashboard/SavingsRateCard";
import TrueEquityCard from "@/components/dashboard/TrueEquityCard";
import InflationToggle from "@/components/dashboard/InflationToggle";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

type DrillDown = { category: string; type: "asset" | "liability" } | null;

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardData();
  const { user } = useAuth();
  const [drillDown, setDrillDown] = useState<DrillDown>(null);
  const [realMode, setRealMode] = useState(false);

  // ─── Initial load / no auth yet ───────────────────────────────────
  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate/30 border-t-brass" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 rounded border border-clay/30 bg-clay/10 px-6 py-12 text-center">
        <p className="text-sm text-clay">Failed to load dashboard data.</p>
        <button onClick={() => window.location.reload()} className="rounded border border-slate/30 bg-white px-4 py-2 text-sm text-ink">
          Try again
        </button>
      </div>
    );
  }

  const {
    snapshots,
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
  } = data;

  const baseCurrency = latestSnapshot?.baseCurrency ?? "GBP";

  // Compute MoM changes for savings rate
  const momChanges = snapshots
    .filter((s) => s.status === "locked")
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((s) => momChange(snapshots, s.month));

  const savingsRate = savingsRateProxy(momChanges);

  // Drill-down data
  const drillDownData = drillDown
    ? categoryTrend(snapshots, drillDown.category, drillDown.type)
    : [];

  // Inflation-adjusted chart data
  const adjustedNwSeries = realMode
    ? nwSeries.map((p) => ({
        ...p,
        netWorth: adjustForInflation(p.netWorth, baseCurrency, p.month),
      }))
    : nwSeries;

  const adjustedAvlSeries = realMode
    ? {
        assets: assetsVsLiabilities.assets.map((p) => ({
          ...p,
          netWorth: adjustForInflation(p.netWorth, baseCurrency, p.month),
        })),
        liabilities: assetsVsLiabilities.liabilities.map((p) => ({
          ...p,
          netWorth: adjustForInflation(p.netWorth, baseCurrency, p.month),
        })),
      }
    : assetsVsLiabilities;

  // ─── Empty state / Onboarding ──────────────────────────────────────
  if (snapshotCount === 0) {
    // Check if user has completed onboarding (stored in sessionStorage)
    const onboardingDone = typeof window !== "undefined" && sessionStorage.getItem("meridian-onboarding-done");

    if (!onboardingDone) {
      return (
        <div className="py-8">
          <OnboardingWizard userId={user?.id ?? ""} onComplete={() => window.location.reload()} />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <NetWorthHeader latestSnapshot={null} momChange={null} snapshotCount={0} />
        <div className="flex flex-col items-center gap-4 rounded border border-dashed border-slate/30 px-6 py-16 text-center">
          <div className="rounded-full bg-brass/10 p-4">
            <svg className="h-8 w-8 text-brass" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-ink">Start tracking your net worth</h2>
          <p className="max-w-sm text-sm text-slate">
            Your dashboard will show your net worth trend, asset allocation, leverage ratio, and goal progress.
          </p>
          <Link href="/entry" className="mt-2 rounded bg-brass px-5 py-2 text-sm text-white transition-colors hover:bg-brass/90">
            Add your first snapshot
          </Link>
        </div>
      </div>
    );
  }

  // ─── Dashboard with data ──────────────────────────────────────────
  return (
    <div className="space-y-6">
      <NetWorthHeader latestSnapshot={latestSnapshot} momChange={latestMoM} snapshotCount={snapshotCount} />

      <GapDetection snapshots={snapshots} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Net Worth Trend or Category Drill-down */}
        <div className="rounded border border-slate/20 p-5 chart-card md:col-span-2">
          {drillDown ? (
            <CategoryTrendChart
              data={drillDownData}
              category={drillDown.category}
              type={drillDown.type}
              currency={baseCurrency}
              onBack={() => setDrillDown(null)}
            />
          ) : (
            <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-ink">Net Worth Trend</p>
              <InflationToggle enabled={realMode} onToggle={setRealMode} currency={baseCurrency} />
            </div>
              <NetWorthTrendChart data={adjustedNwSeries} currency={baseCurrency} />
            </>
          )}
        </div>

        {/* Goals */}
        {goals.length > 0 ? (
          <div className="rounded border border-slate/20 p-5 chart-card space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink">Goals</p>
              {goals.length > 1 && <span className="text-xs text-slate">{goals.length} goals</span>}
            </div>
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                projection={goalProjections.get(goal.id) ?? { status: "INSUFFICIENT_DATA", avgMonthlyGrowth: null, projectedDate: null, monthsNeeded: null, progressPercent: 0 }}
                latestSnapshot={latestSnapshot}
              />
            ))}
            <Link href="/goals" className="block text-xs text-brass hover:underline pt-1">Manage goals</Link>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded border border-dashed border-slate/30 p-5 text-center">
            <p className="text-sm text-slate">No goals yet</p>
            <Link href="/goals" className="text-xs text-brass hover:underline">Set a goal</Link>
          </div>
        )}

        {/* Assets vs Liabilities */}
        <div className="rounded border border-slate/20 p-5 chart-card md:col-span-2">
          <p className="mb-2 text-sm font-medium text-ink">Assets vs Liabilities</p>
          <AssetsVsLiabilitiesChart assets={assetsVsLiabilities.assets} liabilities={assetsVsLiabilities.liabilities} currency={baseCurrency} />
        </div>

        {/* Leverage Ratio */}
        <div className="rounded border border-slate/20 p-5 chart-card">
          <LeverageRatioCard series={leverageSeries} trend={leverageTrend} latestSnapshot={latestSnapshot ? { totalAssets: latestSnapshot.totalAssets, totalLiabilities: latestSnapshot.totalLiabilities } : null} />
        </div>

        {/* Savings Rate Proxy */}
        <div className="rounded border border-slate/20 p-5 chart-card">
          <SavingsRateCard momChanges={momChanges} currency={baseCurrency} />
        </div>

        {/* Asset Allocation Pie */}
        <div className="rounded border border-slate/20 p-5 chart-card">
          <AllocationPie
            data={latestAllocations.assets}
            title="Asset Allocation"
            total={latestSnapshot?.totalAssets ?? 0}
            type="asset"
            onSliceClick={(cat) => setDrillDown({ category: cat, type: "asset" })}
          />
        </div>

        {/* Liability Allocation Pie */}
        <div className="rounded border border-slate/20 p-5 chart-card">
          <AllocationPie
            data={latestAllocations.liabilities}
            title="Liability Allocation"
            total={latestSnapshot?.totalLiabilities ?? 0}
            type="liability"
            onSliceClick={(cat) => setDrillDown({ category: cat, type: "liability" })}
          />
        </div>

        {/* True Equity */}
        <TrueEquityCard latestSnapshot={latestSnapshot} />
      </div>

      {/* Quick links */}
      <div className="flex items-center justify-center gap-4 pt-2 pb-8">
        <Link href="/entry" className="flex items-center gap-1.5 text-sm text-brass hover:underline">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New entry
        </Link>
        <Link href="/history" className="flex items-center gap-1.5 text-sm text-slate hover:text-ink">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          History
        </Link>
        <Link href="/review" className="flex items-center gap-1.5 text-sm text-slate hover:text-ink">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5" />
          </svg>
          Annual review
        </Link>
      </div>
    </div>
  );
}
