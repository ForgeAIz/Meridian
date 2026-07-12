// ─── Entry Page ──────────────────────────────────────────────────────────────
// Monthly snapshot entry form — the core loop.
// Supports ?month=YYYY-MM to edit a specific month.
// Includes month picker for navigating between months.

"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import EntryForm from "@/components/entry/EntryForm";
import MonthPicker from "@/components/entry/MonthPicker";

function EntryPageInner() {
  const searchParams = useSearchParams();
  const month = searchParams.get("month") ?? undefined;

  // Current month for the picker default
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const activeMonth = month ?? currentMonth;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Monthly Entry</h1>
          <p className="mt-1 text-sm text-slate">
            Record your assets and liabilities.
          </p>
        </div>
        <MonthPicker currentMonth={activeMonth} />
      </div>
      <EntryForm month={activeMonth} />
    </div>
  );
}

export default function EntryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate/30 border-t-brass" />
        </div>
      }
    >
      <EntryPageInner />
    </Suspense>
  );
}
