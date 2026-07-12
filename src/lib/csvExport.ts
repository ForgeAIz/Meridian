// ─── CSV Export Utility ──────────────────────────────────────────────────────
// Generates a downloadable CSV file from snapshot data.

import type { Snapshot } from "@/lib/types";

/**
 * Converts an array of snapshots to CSV format and triggers a download.
 * Each entry (asset or liability) becomes one row.
 * Includes a summary section at the bottom with monthly totals.
 */
export function exportToCsv(snapshots: Snapshot[], baseCurrency: string): void {
  const rows: string[][] = [];

  // ─── Header row ────────────────────────────────────────────────────
  rows.push([
    "Month",
    "Type",
    "Name",
    "Category",
    "Currency",
    "Value",
    `Value (${baseCurrency})`,
  ]);

  // ─── Data rows ─────────────────────────────────────────────────────
  const sorted = [...snapshots]
    .filter((s) => s.status === "locked")
    .sort((a, b) => a.month.localeCompare(b.month));

  for (const snap of sorted) {
    for (const entry of snap.assets) {
      rows.push([
        snap.month,
        "Asset",
        entry.name,
        entry.category,
        entry.currency,
        String(entry.value),
        String(entry.valueInBaseCurrency),
      ]);
    }
    for (const entry of snap.liabilities) {
      rows.push([
        snap.month,
        "Liability",
        entry.name,
        entry.category,
        entry.currency,
        String(entry.value),
        String(entry.valueInBaseCurrency),
      ]);
    }
  }

  // ─── Summary section ───────────────────────────────────────────────
  rows.push([]);
  rows.push(["Month", "Total Assets", "Total Liabilities", "Net Worth"]);
  for (const snap of sorted) {
    rows.push([
      snap.month,
      String(snap.totalAssets),
      String(snap.totalLiabilities),
      String(snap.netWorth),
    ]);
  }

  // ─── Build CSV string ──────────────────────────────────────────────
  const csvContent = rows
    .map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma or newline
          if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        })
        .join(",")
    )
    .join("\n");

  // ─── Trigger download ─────────────────────────────────────────────
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `meridian-export-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
