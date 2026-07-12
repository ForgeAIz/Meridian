-- Add notes column to snapshots for tax events, life changes, etc.
alter table public.snapshots
add column if not exists notes text not null default '';
