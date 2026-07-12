-- ─── Meridian — Initial Database Schema ─────────────────────────────────────
-- This migration creates all tables, indexes, and RLS policies for Meridian.
-- Run this in your Supabase SQL Editor or via the Supabase CLI.

-- ─── 1. Extensions ──────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ─── 2. Enums ───────────────────────────────────────────────────────────────

create type currency as enum ('USD', 'GBP', 'EUR', 'AUD', 'CAD');
create type snapshot_status as enum ('draft', 'locked');
create type asset_category as enum ('Cash', 'Investments', 'Property', 'Retirement', 'Vehicles', 'Other');
create type liability_category as enum ('Mortgage', 'Loan', 'Credit Card', 'Student Debt', 'Other');
create type theme_mode as enum ('light', 'dark');
create type auth_provider as enum ('google', 'apple', 'email');

-- ─── 3. Tables ──────────────────────────────────────────────────────────────

-- Users table (extends Supabase auth.users)
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  auth_provider auth_provider not null default 'email',
  created_at  timestamptz not null default now()
);

-- Settings (1:1 with users)
create table if not exists public.settings (
  user_id             uuid primary key references public.users(id) on delete cascade,
  base_currency       currency not null default 'GBP',
  theme               theme_mode not null default 'light',
  month_start_prefill boolean not null default true
);

-- Snapshots
create table if not exists public.snapshots (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  month               text not null check (month ~ '^\d{4}-\d{2}$'),
  status              snapshot_status not null default 'draft',
  base_currency       currency not null default 'GBP',
  fx_rates_used       jsonb,  -- null while draft, frozen on lock: { "USD": 1.27, ... }
  total_assets        numeric(16, 2) not null default 0,
  total_liabilities   numeric(16, 2) not null default 0,
  net_worth           numeric(16, 2) not null default 0,
  locked_at           timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique(user_id, month)  -- one snapshot per user per month
);

-- Asset entries
create table if not exists public.asset_entries (
  id                      uuid primary key default gen_random_uuid(),
  snapshot_id             uuid not null references public.snapshots(id) on delete cascade,
  name                    text not null,
  category                asset_category not null,
  currency                currency not null,
  value                   numeric(16, 2) not null check (value >= 0),
  value_in_base_currency  numeric(16, 2) not null default 0
);

-- Liability entries
create table if not exists public.liability_entries (
  id                      uuid primary key default gen_random_uuid(),
  snapshot_id             uuid not null references public.snapshots(id) on delete cascade,
  name                    text not null,
  category                liability_category not null,
  currency                currency not null,
  value                   numeric(16, 2) not null check (value >= 0),
  value_in_base_currency  numeric(16, 2) not null default 0,
  linked_asset_id         uuid references public.asset_entries(id) on delete set null
);

-- Goals
create table if not exists public.goals (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users(id) on delete cascade,
  label             text not null,
  target_net_worth  numeric(16, 2) not null check (target_net_worth > 0),
  target_date       text not null check (target_date ~ '^\d{4}-\d{2}$'),
  currency          currency not null,
  created_at        timestamptz not null default now()
);

-- ─── 4. Indexes ─────────────────────────────────────────────────────────────

create index idx_snapshots_user_month on public.snapshots(user_id, month desc);
create index idx_asset_entries_snapshot on public.asset_entries(snapshot_id);
create index idx_liability_entries_snapshot on public.liability_entries(snapshot_id);
create index idx_goals_user on public.goals(user_id);

-- ─── 5. Row-Level Security ──────────────────────────────────────────────────

alter table public.users enable row level security;
alter table public.settings enable row level security;
alter table public.snapshots enable row level security;
alter table public.asset_entries enable row level security;
alter table public.liability_entries enable row level security;
alter table public.goals enable row level security;

-- Users: can only read/update their own record
create policy "Users can read own record"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own record"
  on public.users for update
  using (auth.uid() = id);

-- Settings: can only read/update own settings
create policy "Users can read own settings"
  on public.settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own settings"
  on public.settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own settings"
  on public.settings for update
  using (auth.uid() = user_id);

-- Snapshots: own snapshots only
create policy "Users can read own snapshots"
  on public.snapshots for select
  using (auth.uid() = user_id);

create policy "Users can insert own snapshots"
  on public.snapshots for insert
  with check (auth.uid() = user_id);

create policy "Users can update own snapshots"
  on public.snapshots for update
  using (auth.uid() = user_id);

create policy "Users can delete own snapshots"
  on public.snapshots for delete
  using (auth.uid() = user_id);

-- Asset entries: through own snapshots
create policy "Users can read own asset entries"
  on public.asset_entries for select
  using (exists (
    select 1 from public.snapshots where id = snapshot_id and user_id = auth.uid()
  ));

create policy "Users can insert own asset entries"
  on public.asset_entries for insert
  with check (exists (
    select 1 from public.snapshots where id = snapshot_id and user_id = auth.uid()
  ));

create policy "Users can update own asset entries"
  on public.asset_entries for update
  using (exists (
    select 1 from public.snapshots where id = snapshot_id and user_id = auth.uid()
  ));

create policy "Users can delete own asset entries"
  on public.asset_entries for delete
  using (exists (
    select 1 from public.snapshots where id = snapshot_id and user_id = auth.uid()
  ));

-- Liability entries: through own snapshots
create policy "Users can read own liability entries"
  on public.liability_entries for select
  using (exists (
    select 1 from public.snapshots where id = snapshot_id and user_id = auth.uid()
  ));

create policy "Users can insert own liability entries"
  on public.liability_entries for insert
  with check (exists (
    select 1 from public.snapshots where id = snapshot_id and user_id = auth.uid()
  ));

create policy "Users can update own liability entries"
  on public.liability_entries for update
  using (exists (
    select 1 from public.snapshots where id = snapshot_id and user_id = auth.uid()
  ));

create policy "Users can delete own liability entries"
  on public.liability_entries for delete
  using (exists (
    select 1 from public.snapshots where id = snapshot_id and user_id = auth.uid()
  ));

-- Goals: own goals only
create policy "Users can read own goals"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Users can insert own goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own goals"
  on public.goals for update
  using (auth.uid() = user_id);

create policy "Users can delete own goals"
  on public.goals for delete
  using (auth.uid() = user_id);

-- ─── 6. Triggers ────────────────────────────────────────────────────────────

-- Auto-create settings row when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, auth_provider)
  values (new.id, new.email, 'email');

  insert into public.settings (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at on snapshots
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger snapshots_updated_at
  before update on public.snapshots
  for each row execute function public.update_updated_at();
