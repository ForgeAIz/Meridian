// ─── Entry Page ──────────────────────────────────────────────────────────────
// Monthly snapshot entry form — the core loop.
// Supports ?month=YYYY-MM to edit a specific month.

"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import EntryForm from "@/components/entry/EntryForm";

function EntryPageInner() {
  const searchParams = useSearchParams();
  const month = searchParams.get("month") ?? undefined;

  return <EntryForm month={month} />;
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
