// ─── MonthPicker ────────────────────────────────────────────────────────────
// A month/year selector for navigating to any month's entry.
// Used on the entry page to let users backfill past months or jump to a
// specific month.

"use client";

import { useRouter } from "next/navigation";

interface MonthPickerProps {
  currentMonth: string;
}

function getMonths(): string[] {
  const months: string[] = [];
  const now = new Date();
  // Show from 24 months ago to current month
  for (let i = 24; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  }
  return months;
}

const MONTH_NAMES: Record<string, string> = {
  "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
};

export default function MonthPicker({ currentMonth }: MonthPickerProps) {
  const router = useRouter();
  const months = getMonths();
  const [year, m] = currentMonth.split("-");
  const label = `${MONTH_NAMES[m] ?? m} ${year}`;

  return (
    <div className="relative">
      <select
        value={currentMonth}
        onChange={(e) => router.push(`/entry?month=${e.target.value}`)}
        className="appearance-none rounded border border-slate/20 bg-white px-3 py-2 pr-8 text-sm text-ink focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass cursor-pointer"
      >
        {months.map((month) => {
          const [y, mStr] = month.split("-");
          const name = `${MONTH_NAMES[mStr] ?? mStr} ${y}`;
          return (
            <option key={month} value={month}>
              {name}
            </option>
          );
        })}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <svg className="h-4 w-4 text-slate" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </div>
  );
}
