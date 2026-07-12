// ─── Meridian Core Types ─────────────────────────────────────────────────────
// Data model entities, enums, and shared types per the full documentation spec.

// ─── Currencies ──────────────────────────────────────────────────────────────

export type Currency = "USD" | "GBP" | "EUR" | "AUD" | "CAD";

export const SUPPORTED_CURRENCIES: Currency[] = ["USD", "GBP", "EUR", "AUD", "CAD"];

export type FxRates = Record<Currency, number>;
// Rates are { USD: 1.0, GBP: 0.79, EUR: 0.92, ... }
// All rates expressed as "1 baseCurrency = X thisCurrency"

// ─── Categories ──────────────────────────────────────────────────────────────

export type AssetCategory =
  | "Cash"
  | "Investments"
  | "Property"
  | "Retirement"
  | "Vehicles"
  | "Other";

export type LiabilityCategory =
  | "Mortgage"
  | "Loan"
  | "Credit Card"
  | "Student Debt"
  | "Other";

// ─── Entries ─────────────────────────────────────────────────────────────────

export interface Entry {
  id: string;
  name: string;
  currency: Currency;
  value: number;
  valueInBaseCurrency: number;
  ticker?: string;
}

export interface AssetEntry extends Entry {
  category: AssetCategory;
}

export interface LiabilityEntry extends Entry {
  category: LiabilityCategory;
  linkedAssetId?: string; // optional link to an asset for true equity calc
}

// ─── Snapshot ─────────────────────────────────────────────────────────────────

export type SnapshotStatus = "draft" | "locked";

export interface Snapshot {
  id: string;
  userId: string;
  month: string; // "2026-03"
  status: SnapshotStatus;
  baseCurrency: Currency;
  fxRatesUsed: FxRates | null; // null while in DRAFT, frozen on LOCK
  assets: AssetEntry[];
  liabilities: LiabilityEntry[];
  totalAssets: number; // derived: sum of asset valueInBaseCurrency
  totalLiabilities: number; // derived: sum of liability valueInBaseCurrency
  netWorth: number; // derived: totalAssets - totalLiabilities
  lockedAt: string | null; // ISO timestamp, null when DRAFT
  notes: string;
}

// ─── Goal ─────────────────────────────────────────────────────────────────────

export type GoalStatus = "ON_TRACK" | "BEHIND_PACE" | "OFF_PACE" | "INSUFFICIENT_DATA" | "ACHIEVED";

export type GoalCategory = "Retirement" | "House" | "Debt" | "Investment" | "Education" | "Travel" | "Emergency" | "Custom";

export const GOAL_CATEGORIES: GoalCategory[] = [
  "Retirement", "House", "Debt", "Investment", "Education", "Travel", "Emergency", "Custom",
];

export interface Goal {
  id: string;
  userId: string;
  label: string;
  targetNetWorth: number;
  targetDate: string;
  currency: Currency;
  category: GoalCategory;
  priority: number;
  createdAt: string;
}

export interface GoalProjection {
  status: GoalStatus;
  avgMonthlyGrowth: number | null;
  projectedDate: string | null; // null when OFF_PACE or INSUFFICIENT_DATA
  monthsNeeded: number | null;
  progressPercent: number; // current net worth / target * 100
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export type ThemeMode = "light" | "dark";

export interface Settings {
  userId: string;
  baseCurrency: Currency;
  theme: ThemeMode;
  monthStartPrefill: boolean;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export type AuthProvider = "google" | "apple" | "email";

export interface User {
  id: string;
  email: string;
  authProvider: AuthProvider;
  createdAt: string;
}

// ─── Dashboard aggregation types ─────────────────────────────────────────────

export interface NetWorthPoint {
  month: string;
  netWorth: number;
}

export interface LeveragePoint {
  month: string;
  ratio: number;
}

export interface CategoryAllocation {
  category: string;
  total: number;
  percent: number;
}

export interface MomChangeResult {
  delta: number;
  percent: number | null; // null when previous net worth was 0
}

export interface TrendLabel {
  direction: "Improving" | "Stable" | "Rising";
}
