// ─── EntryRow ────────────────────────────────────────────────────────────────
// A single editable row for an asset or liability entry.
// Fields: name, category, currency, value.

"use client";

import { useEffect, useState } from "react";
import type { Currency, AssetCategory, LiabilityCategory } from "@/lib/types";
import { SUPPORTED_CURRENCIES } from "@/lib/types";

interface EntryRowProps {
  id: string;
  name: string;
  category: string;
  currency: Currency;
  value: number;
  valueInBaseCurrency: number;
  type: "asset" | "liability";
  index: number;
  isRemoving?: boolean;
  onUpdate: (id: string, field: string, value: string | number) => void;
  onDelete: (id: string) => void;
}

const ASSET_CATEGORIES: AssetCategory[] = [
  "Cash", "Investments", "Property", "Retirement", "Vehicles", "Other",
];

const LIABILITY_CATEGORIES: LiabilityCategory[] = [
  "Mortgage", "Loan", "Credit Card", "Student Debt", "Other",
];

export default function EntryRow({
  id,
  name,
  category,
  currency,
  value,
  type,
  index,
  isRemoving,
  onUpdate,
  onDelete,
}: EntryRowProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(timer);
  }, []);

  const categories = type === "asset" ? ASSET_CATEGORIES : LIABILITY_CATEGORIES;
  const delayClass = `delay-${Math.min(index, 5)}`;

  return (
    <div
      className={`group flex flex-col gap-2 rounded-md border border-slate/20 bg-white px-3 py-3 sm:flex-row sm:items-center sm:gap-3
        ${mounted && !isRemoving ? "animate-fade-slide-up " + delayClass : ""}
        ${isRemoving ? "animate-collapse-out" : ""}`}
    >
      {/* Name */}
      <div className="flex-1 min-w-0">
        <label className="block text-xs text-slate sm:hidden">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => onUpdate(id, "name", e.target.value)}
          placeholder={type === "asset" ? "e.g. Vanguard ISA" : "e.g. Mortgage"}
          className="w-full rounded border border-slate/20 bg-transparent px-2 py-1.5 text-sm text-ink placeholder:text-slate/40 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass truncate"
        />
      </div>

      {/* Category */}
      <div className="flex items-center gap-2 sm:gap-0">
        <label className="text-xs text-slate sm:hidden w-16 shrink-0">Category</label>
        <select
          value={category}
          onChange={(e) => onUpdate(id, "category", e.target.value)}
          className="flex-1 rounded border border-slate/20 bg-transparent px-2 py-1.5 text-sm text-ink focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Currency + Value row */}
      <div className="flex items-center gap-2 sm:gap-0">
        <label className="text-xs text-slate sm:hidden w-16 shrink-0">Currency</label>
        <select
          value={currency}
          onChange={(e) => onUpdate(id, "currency", e.target.value)}
          className="rounded border border-slate/20 bg-transparent px-2 py-1.5 text-sm text-ink focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
        >
          {SUPPORTED_CURRENCIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <label className="text-xs text-slate sm:hidden ml-3 mr-1">Value</label>
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onUpdate(id, "value", parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          min="0"
          step="0.01"
          className="flex-1 sm:w-28 rounded border border-slate/20 bg-transparent px-2 py-1.5 text-right font-mono text-sm text-ink placeholder:text-slate/40 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
        />
      </div>

      {/* Delete button */}
      <button
        onClick={() => onDelete(id)}
        className="flex h-11 w-11 items-center justify-center self-end rounded-md text-slate/40 transition-colors hover:bg-clay/10 hover:text-clay sm:h-8 sm:w-8 sm:self-center sm:opacity-0 sm:group-hover:opacity-100"
        aria-label="Delete row"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
