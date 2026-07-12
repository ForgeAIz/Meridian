// ─── Supabase Queries ───────────────────────────────────────────────────────
// All read/write calls to Supabase, isolated from components.
// Components never call Supabase directly — they call these functions or
// the React Query hooks that wrap them.

import { createClient } from "./client";
import type {
  Snapshot,
  AssetEntry,
  LiabilityEntry,
  Goal,
  Settings,
  Currency,
  FxRates,
  SnapshotStatus,
} from "../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapRowToSnapshot(row: Record<string, any>): Snapshot {
  return {
    id: row.id,
    userId: row.user_id,
    month: row.month,
    status: row.status as SnapshotStatus,
    baseCurrency: row.base_currency as Currency,
    fxRatesUsed: row.fx_rates_used as FxRates | null,
    assets: [],
    liabilities: [],
    totalAssets: Number(row.total_assets),
    totalLiabilities: Number(row.total_liabilities),
    netWorth: Number(row.net_worth),
    lockedAt: row.locked_at,
    notes: row.notes ?? "",
  };
}

function mapAssetEntry(row: Record<string, any>): AssetEntry {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    currency: row.currency as Currency,
    value: Number(row.value),
    valueInBaseCurrency: Number(row.value_in_base_currency),
  };
}

function mapLiabilityEntry(row: Record<string, any>): LiabilityEntry {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    currency: row.currency as Currency,
    value: Number(row.value),
    valueInBaseCurrency: Number(row.value_in_base_currency),
    linkedAssetId: row.linked_asset_id ?? undefined,
  };
}

function mapGoal(row: Record<string, any>): Goal {
  return {
    id: row.id,
    userId: row.user_id,
    label: row.label,
    targetNetWorth: Number(row.target_net_worth),
    targetDate: row.target_date,
    currency: row.currency as Currency,
    category: row.category ?? "Custom",
    priority: row.priority ?? 0,
    createdAt: row.created_at,
  };
}

function mapSettings(row: Record<string, any>): Settings {
  return {
    userId: row.user_id,
    baseCurrency: row.base_currency as Currency,
    theme: row.theme as "light" | "dark",
    monthStartPrefill: row.month_start_prefill,
  };
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = createClient();
  return supabase.auth.signUp({ email, password });
}

export async function signInWithGoogle() {
  const supabase = createClient();
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
}

export async function signInWithApple() {
  const supabase = createClient();
  return supabase.auth.signInWithOAuth({
    provider: "apple",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
}

export async function signOut() {
  const supabase = createClient();
  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function fetchSettings(userId: string): Promise<Settings | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", userId)
    .single();
  return data ? mapSettings(data) : null;
}

export async function updateSettings(
  userId: string,
  updates: Partial<Pick<Settings, "baseCurrency" | "theme" | "monthStartPrefill">>
) {
  const supabase = createClient();
  const dbUpdates: Record<string, unknown> = {};
  if (updates.baseCurrency) dbUpdates.base_currency = updates.baseCurrency;
  if (updates.theme) dbUpdates.theme = updates.theme;
  if (updates.monthStartPrefill !== undefined)
    dbUpdates.month_start_prefill = updates.monthStartPrefill;

  return supabase.from("settings").update(dbUpdates).eq("user_id", userId);
}

// ─── Snapshots ──────────────────────────────────────────────────────────────

export async function fetchSnapshotByMonth(
  userId: string,
  month: string
): Promise<Snapshot | null> {
  const supabase = createClient();

  const { data: snapRow } = await supabase
    .from("snapshots")
    .select("*")
    .eq("user_id", userId)
    .eq("month", month)
    .single();

  if (!snapRow) return null;

  const snapshot = mapRowToSnapshot(snapRow);

  // Fetch entries
  const [assetRes, liabilityRes] = await Promise.all([
    supabase.from("asset_entries").select("*").eq("snapshot_id", snapshot.id),
    supabase
      .from("liability_entries")
      .select("*")
      .eq("snapshot_id", snapshot.id),
  ]);

  snapshot.assets = (assetRes.data ?? []).map(mapAssetEntry);
  snapshot.liabilities = (liabilityRes.data ?? []).map(mapLiabilityEntry);

  return snapshot;
}

export async function fetchLatestLockedSnapshot(
  userId: string,
  beforeMonth?: string
): Promise<Snapshot | null> {
  const supabase = createClient();

  let query = supabase
    .from("snapshots")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "locked")
    .order("month", { ascending: false })
    .limit(1);

  if (beforeMonth) {
    query = query.lt("month", beforeMonth);
  }

  const { data } = await query.single();
  if (!data) return null;

  const snapshot = mapRowToSnapshot(data);

  // Fetch entries
  const [assetRes, liabilityRes] = await Promise.all([
    supabase.from("asset_entries").select("*").eq("snapshot_id", snapshot.id),
    supabase
      .from("liability_entries")
      .select("*")
      .eq("snapshot_id", snapshot.id),
  ]);

  snapshot.assets = (assetRes.data ?? []).map(mapAssetEntry);
  snapshot.liabilities = (liabilityRes.data ?? []).map(mapLiabilityEntry);

  return snapshot;
}

export async function fetchAllLockedSnapshots(
  userId: string
): Promise<Snapshot[]> {
  const supabase = createClient();

  const { data: snapRows } = await supabase
    .from("snapshots")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "locked")
    .order("month", { ascending: true });

  if (!snapRows || snapRows.length === 0) return [];

  const snapIds = snapRows.map((r) => r.id);

  // Batch fetch all entries for all snapshots
  const [assetRes, liabilityRes] = await Promise.all([
    supabase.from("asset_entries").select("*").in("snapshot_id", snapIds),
    supabase.from("liability_entries").select("*").in("snapshot_id", snapIds),
  ]);

  const assetMap = new Map<string, AssetEntry[]>();
  for (const row of assetRes.data ?? []) {
    const list = assetMap.get(row.snapshot_id) ?? [];
    list.push(mapAssetEntry(row));
    assetMap.set(row.snapshot_id, list);
  }

  const liabilityMap = new Map<string, LiabilityEntry[]>();
  for (const row of liabilityRes.data ?? []) {
    const list = liabilityMap.get(row.snapshot_id) ?? [];
    list.push(mapLiabilityEntry(row));
    liabilityMap.set(row.snapshot_id, list);
  }

  return snapRows.map((row) => {
    const snapshot = mapRowToSnapshot(row);
    snapshot.assets = assetMap.get(snapshot.id) ?? [];
    snapshot.liabilities = liabilityMap.get(snapshot.id) ?? [];
    return snapshot;
  });
}

export async function upsertSnapshot(snapshot: Snapshot) {
  const supabase = createClient();

  // Upsert the snapshot row
  const { data: snapRow, error: snapError } = await supabase
    .from("snapshots")
    .upsert(
      {
        id: snapshot.id,
        user_id: snapshot.userId,
        month: snapshot.month,
        status: snapshot.status,
        base_currency: snapshot.baseCurrency,
        fx_rates_used: snapshot.fxRatesUsed,
        total_assets: snapshot.totalAssets,
        total_liabilities: snapshot.totalLiabilities,
        net_worth: snapshot.netWorth,
        locked_at: snapshot.lockedAt,
        notes: snapshot.notes ?? "",
      },
      { onConflict: "user_id, month" }
    )
    .select("id")
    .single();

  if (snapError || !snapRow) throw snapError ?? new Error("Failed to upsert snapshot");
  const snapshotId = snapRow.id;

  // Delete existing entries then re-insert (simpler than diffing)
  await Promise.all([
    supabase.from("asset_entries").delete().eq("snapshot_id", snapshotId),
    supabase.from("liability_entries").delete().eq("snapshot_id", snapshotId),
  ]);

  if (snapshot.assets.length > 0) {
    const { error: assetError } = await supabase.from("asset_entries").insert(
      snapshot.assets.map((e) => ({
        snapshot_id: snapshotId,
        name: e.name,
        category: e.category,
        currency: e.currency,
        value: e.value,
        value_in_base_currency: e.valueInBaseCurrency,
      }))
    );
    if (assetError) throw assetError;
  }

  if (snapshot.liabilities.length > 0) {
    const { error: liabilityError } = await supabase.from("liability_entries").insert(
      snapshot.liabilities.map((e) => ({
        snapshot_id: snapshotId,
        name: e.name,
        category: e.category,
        currency: e.currency,
        value: e.value,
        value_in_base_currency: e.valueInBaseCurrency,
        linked_asset_id: e.linkedAssetId ?? null,
      }))
    );
    if (liabilityError) throw liabilityError;
  }
}

// ─── Goals ───────────────────────────────────────────────────────────────────

export async function fetchGoals(userId: string): Promise<Goal[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  return (data ?? []).map(mapGoal);
}

export async function insertGoal(goal: Omit<Goal, "id" | "createdAt">) {
  const supabase = createClient();
  return supabase
    .from("goals")
    .insert({
      user_id: goal.userId,
      label: goal.label,
      target_net_worth: goal.targetNetWorth,
      target_date: goal.targetDate,
      currency: goal.currency,
      category: goal.category ?? "Custom",
      priority: goal.priority ?? 0,
    })
    .select("id")
    .single();
}

export async function updateGoal(
  goalId: string,
  updates: Partial<Pick<Goal, "label" | "targetNetWorth" | "targetDate">>
) {
  const supabase = createClient();
  const dbUpdates: Record<string, unknown> = {};
  if (updates.label) dbUpdates.label = updates.label;
  if (updates.targetNetWorth !== undefined)
    dbUpdates.target_net_worth = updates.targetNetWorth;
  if (updates.targetDate) dbUpdates.target_date = updates.targetDate;

  return supabase.from("goals").update(dbUpdates).eq("id", goalId);
}

export async function deleteGoal(goalId: string) {
  const supabase = createClient();
  return supabase.from("goals").delete().eq("id", goalId);
}
