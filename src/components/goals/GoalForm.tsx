// ─── GoalForm ────────────────────────────────────────────────────────────────
// Create or edit a financial goal. Shows live projection preview when snapshots exist.

"use client";

import { useState, useEffect } from "react";
import type { Goal, Currency } from "@/lib/types";
import { SUPPORTED_CURRENCIES } from "@/lib/types";

interface GoalFormProps {
  initialGoal?: Goal | null;
  onSave: (goal: {
    userId: string;
    label: string;
    targetNetWorth: number;
    targetDate: string;
    currency: Currency;
  }) => void;
  onCancel: () => void;
  userId: string;
  isSaving: boolean;
}

export default function GoalForm({
  initialGoal,
  onSave,
  onCancel,
  userId,
  isSaving,
}: GoalFormProps) {
  const [label, setLabel] = useState(initialGoal?.label ?? "");
  const [targetNetWorth, setTargetNetWorth] = useState(
    initialGoal?.targetNetWorth ?? 0
  );
  const [targetDate, setTargetDate] = useState(initialGoal?.targetDate ?? "");
  const [currency, setCurrency] = useState<Currency>(
    initialGoal?.currency ?? "GBP"
  );
  const [error, setError] = useState<string | null>(null);

  // Convert "YYYY-MM" to "YYYY-MM" for the date input
  const dateValue = targetDate.length === 7 ? `${targetDate}-01` : "";
  const displayDate = dateValue ? dateValue.slice(0, 7) : "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!label.trim()) {
      setError("Please enter a goal name.");
      return;
    }

    if (targetNetWorth <= 0) {
      setError("Target net worth must be greater than 0.");
      return;
    }

    if (!targetDate) {
      setError("Please select a target date.");
      return;
    }

    if (targetDate <= getCurrentMonth()) {
      setError("Target date must be in the future.");
      return;
    }

    onSave({
      userId,
      label: label.trim(),
      targetNetWorth,
      targetDate,
      currency,
    });
  }

  function handleMonthChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (val) {
      setTargetDate(val.slice(0, 7));
    } else {
      setTargetDate("");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded border border-slate/20 bg-white p-5 space-y-4"
    >
      <h2 className="text-sm font-medium text-ink">
        {initialGoal ? "Edit goal" : "New goal"}
      </h2>

      {error && (
        <div className="rounded border border-clay/30 bg-clay/10 px-3 py-2 text-sm text-clay">
          {error}
        </div>
      )}

      {/* Label */}
      <div>
        <label htmlFor="goal-label" className="block text-xs text-slate">
          Goal name
        </label>
        <input
          id="goal-label"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Retire by 55"
          className="mt-1 w-full rounded border border-slate/30 bg-paper px-3 py-2 text-sm text-ink placeholder:text-slate/40 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
          autoFocus
        />
      </div>

      {/* Target Net Worth */}
      <div>
        <label htmlFor="goal-target" className="block text-xs text-slate">
          Target net worth
        </label>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm text-slate">
            {currency === "GBP" ? "£" : currency === "USD" ? "$" : currency === "EUR" ? "€" : currency}
          </span>
          <input
            id="goal-target"
            type="number"
            value={targetNetWorth || ""}
            onChange={(e) => setTargetNetWorth(parseFloat(e.target.value) || 0)}
            placeholder="500000"
            min="1"
            step="1000"
            className="flex-1 rounded border border-slate/30 bg-paper px-3 py-2 text-sm font-mono text-ink placeholder:text-slate/40 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
          />
        </div>
      </div>

      {/* Target Date */}
      <div>
        <label htmlFor="goal-date" className="block text-xs text-slate">
          Target date
        </label>
        <input
          id="goal-date"
          type="month"
          value={displayDate}
          onChange={handleMonthChange}
          min={getCurrentMonth()}
          className="mt-1 w-full rounded border border-slate/30 bg-paper px-3 py-2 text-sm text-ink focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
        />
      </div>

      {/* Currency */}
      <div>
        <label htmlFor="goal-currency" className="block text-xs text-slate">
          Currency
        </label>
        <select
          id="goal-currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as Currency)}
          className="mt-1 rounded border border-slate/30 bg-paper px-3 py-2 text-sm text-ink focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
        >
          {SUPPORTED_CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded bg-brass px-5 py-2 text-sm text-white transition-colors hover:bg-brass/90 disabled:opacity-50"
        >
          {isSaving ? "Saving…" : initialGoal ? "Save changes" : "Create goal"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-slate/30 bg-white px-4 py-2 text-sm text-slate transition-colors hover:bg-slate/5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
