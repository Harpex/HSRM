-- LifeTrack Pro production Supabase schema.
-- Supabase Auth stores credentials securely in auth.users.
-- Do not store plaintext passwords or custom password hashes in public tables.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-zA-Z0-9_]{3,24}$'),
  email text not null unique,
  age integer check (age between 10 and 120),
  gender text check (gender in ('kadin', 'erkek', 'belirtmek_istemiyorum') or gender is null),
  height_cm numeric(5,2) check (height_cm between 50 and 300),
  weight_kg numeric(6,2) check (weight_kg between 20 and 500),
  target_weight_kg numeric(6,2) check (target_weight_kg between 20 and 500),
  activity_level text not null default 'orta'
    check (activity_level in ('cok_dusuk', 'dusuk', 'orta', 'yuksek', 'cok_yuksek')),
  daily_water_goal_ml integer not null default 2500 check (daily_water_goal_ml > 0 and daily_water_goal_ml <= 10000),
  daily_step_goal integer not null default 9000 check (daily_step_goal >= 0 and daily_step_goal <= 100000),
  daily_calorie_goal integer check (daily_calorie_goal >= 0 and daily_calorie_goal <= 15000),
  sleep_goal_hours numeric(4,2) not null default 7.5 check (sleep_goal_hours >= 0 and sleep_goal_hours <= 24),
  notes text not null default '',
  goal_description text not null default '',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  water_intake_ml integer not null default 0 check (water_intake_ml >= 0 and water_intake_ml <= 15000),
  steps_count integer not null default 0 check (steps_count >= 0 and steps_count <= 150000),
  sleep_hours numeric(4,2) not null default 0 check (sleep_hours >= 0 and sleep_hours <= 24),
  calorie_intake integer check (calorie_intake >= 0 and calorie_intake <= 20000),
  weight_kg_snapshot numeric(6,2) check (weight_kg_snapshot >= 0 and weight_kg_snapshot <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists profiles_username_idx on public.profiles(lower(username));
create index if not exists profiles_email_idx on public.profiles(lower(email));
create index if not exists daily_logs_user_date_idx on public.daily_logs(user_id, date desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists daily_logs_set_updated_at on public.daily_logs;
create trigger daily_logs_set_updated_at
before update on public.daily_logs
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.daily_logs enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read their own daily logs" on public.daily_logs;
create policy "Users can read their own daily logs"
  on public.daily_logs
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own daily logs" on public.daily_logs;
create policy "Users can insert their own daily logs"
  on public.daily_logs
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own daily logs" on public.daily_logs;
create policy "Users can update their own daily logs"
  on public.daily_logs
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own daily logs" on public.daily_logs;
create policy "Users can delete their own daily logs"
  on public.daily_logs
  for delete
  using (auth.uid() = user_id);
