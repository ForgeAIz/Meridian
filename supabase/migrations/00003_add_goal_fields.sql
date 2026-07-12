// Add priority and category columns to goals table
alter table public.goals
add column if not exists priority integer not null default 0,
add column if not exists category text not null default 'Custom';
