-- LifeTrack Pro production Supabase schema.
-- Supabase Auth stores credentials securely in auth.users.
-- Public tables store roles, profiles, health data, dietitian relations, notes, plans and check-ins.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'dietitian', 'admin')),
  username text not null unique check (username ~ '^[a-zA-Z0-9_]{3,24}$'),
  full_name text not null default '',
  email text not null unique,
  age integer check (age between 10 and 120),
  gender text check (gender in ('kadin', 'erkek', 'belirtmek_istemiyorum') or gender is null),
  height_cm numeric(5,2) check (height_cm between 50 and 300),
  weight_kg numeric(6,2) check (weight_kg between 20 and 500),
  target_weight_kg numeric(6,2) check (target_weight_kg between 20 and 500),
  activity_level text not null default 'orta' check (activity_level in ('cok_dusuk', 'dusuk', 'orta', 'yuksek', 'cok_yuksek')),
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

create table if not exists public.dietitian_patients (
  id uuid primary key default gen_random_uuid(),
  dietitian_user_id uuid not null references auth.users(id) on delete cascade,
  patient_user_id uuid not null references auth.users(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'paused')),
  internal_note text not null default '',
  unique (dietitian_user_id, patient_user_id)
);

create table if not exists public.dietitian_notes (
  id uuid primary key default gen_random_uuid(),
  dietitian_user_id uuid not null references auth.users(id) on delete cascade,
  patient_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  note_content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  dietitian_user_id uuid not null references auth.users(id) on delete cascade,
  patient_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  start_date date not null,
  end_date date,
  status text not null default 'draft' check (status in ('active', 'inactive', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.meal_plan_items (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid not null references public.meal_plans(id) on delete cascade,
  meal_type text not null,
  item_text text not null,
  sort_order integer not null default 0
);

create table if not exists public.weekly_checkins (
  id uuid primary key default gen_random_uuid(),
  dietitian_user_id uuid not null references auth.users(id) on delete cascade,
  patient_user_id uuid not null references auth.users(id) on delete cascade,
  week_start_date date not null,
  week_end_date date not null,
  summary text not null,
  weight_comment text not null default '',
  water_comment text not null default '',
  steps_comment text not null default '',
  adherence_score integer not null check (adherence_score between 0 and 100),
  next_goal text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_username_idx on public.profiles(lower(username));
create index if not exists profiles_email_idx on public.profiles(lower(email));
create index if not exists daily_logs_user_date_idx on public.daily_logs(user_id, date desc);
create index if not exists dietitian_patients_dietitian_idx on public.dietitian_patients(dietitian_user_id);
create index if not exists dietitian_patients_patient_idx on public.dietitian_patients(patient_user_id);
create index if not exists dietitian_notes_patient_idx on public.dietitian_notes(dietitian_user_id, patient_user_id);
create index if not exists meal_plans_patient_idx on public.meal_plans(dietitian_user_id, patient_user_id);
create index if not exists weekly_checkins_patient_idx on public.weekly_checkins(dietitian_user_id, patient_user_id);

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
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists daily_logs_set_updated_at on public.daily_logs;
create trigger daily_logs_set_updated_at before update on public.daily_logs for each row execute function public.set_updated_at();
drop trigger if exists dietitian_notes_set_updated_at on public.dietitian_notes;
create trigger dietitian_notes_set_updated_at before update on public.dietitian_notes for each row execute function public.set_updated_at();
drop trigger if exists meal_plans_set_updated_at on public.meal_plans;
create trigger meal_plans_set_updated_at before update on public.meal_plans for each row execute function public.set_updated_at();
drop trigger if exists weekly_checkins_set_updated_at on public.weekly_checkins;
create trigger weekly_checkins_set_updated_at before update on public.weekly_checkins for each row execute function public.set_updated_at();

create or replace function public.is_dietitian_for(patient_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.dietitian_patients dp
    where dp.dietitian_user_id = auth.uid()
      and dp.patient_user_id = patient_id
      and dp.status = 'active'
  );
$$;

create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
as $$
  select role from public.profiles where user_id = auth.uid();
$$;

alter table public.profiles enable row level security;
alter table public.daily_logs enable row level security;
alter table public.dietitian_patients enable row level security;
alter table public.dietitian_notes enable row level security;
alter table public.meal_plans enable row level security;
alter table public.meal_plan_items enable row level security;
alter table public.weekly_checkins enable row level security;

create policy "Own profile or assigned patient profile select" on public.profiles
  for select using (auth.uid() = user_id or public.is_dietitian_for(user_id) or public.current_user_role() = 'admin');
create policy "Users insert own profile" on public.profiles
  for insert with check (auth.uid() = user_id);
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Own logs or assigned patient logs select" on public.daily_logs
  for select using (auth.uid() = user_id or public.is_dietitian_for(user_id) or public.current_user_role() = 'admin');
create policy "Users insert own logs" on public.daily_logs
  for insert with check (auth.uid() = user_id);
create policy "Users update own logs" on public.daily_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own logs" on public.daily_logs
  for delete using (auth.uid() = user_id);

create policy "Dietitians manage own relations" on public.dietitian_patients
  for all using (auth.uid() = dietitian_user_id and public.current_user_role() = 'dietitian')
  with check (auth.uid() = dietitian_user_id and public.current_user_role() = 'dietitian');

create policy "Admins can read all relations" on public.dietitian_patients
  for select using (public.current_user_role() = 'admin');

create policy "Dietitians manage own notes" on public.dietitian_notes
  for all using (auth.uid() = dietitian_user_id and public.is_dietitian_for(patient_user_id))
  with check (auth.uid() = dietitian_user_id and public.is_dietitian_for(patient_user_id));

create policy "Admins can read all notes" on public.dietitian_notes
  for select using (public.current_user_role() = 'admin');

create policy "Patients read assigned active plans" on public.meal_plans
  for select using (auth.uid() = patient_user_id or auth.uid() = dietitian_user_id or public.current_user_role() = 'admin');
create policy "Dietitians manage own plans" on public.meal_plans
  for all using (auth.uid() = dietitian_user_id and public.is_dietitian_for(patient_user_id))
  with check (auth.uid() = dietitian_user_id and public.is_dietitian_for(patient_user_id));

create policy "Plan items readable through visible plan" on public.meal_plan_items
  for select using (
    exists (
      select 1 from public.meal_plans mp
      where mp.id = meal_plan_id
        and (mp.patient_user_id = auth.uid() or mp.dietitian_user_id = auth.uid() or public.current_user_role() = 'admin')
    )
  );
create policy "Dietitians manage own plan items" on public.meal_plan_items
  for all using (
    exists (select 1 from public.meal_plans mp where mp.id = meal_plan_id and mp.dietitian_user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.meal_plans mp where mp.id = meal_plan_id and mp.dietitian_user_id = auth.uid())
  );

create policy "Patients and dietitians read checkins" on public.weekly_checkins
  for select using (auth.uid() = patient_user_id or auth.uid() = dietitian_user_id or public.current_user_role() = 'admin');
create policy "Dietitians manage own checkins" on public.weekly_checkins
  for all using (auth.uid() = dietitian_user_id and public.is_dietitian_for(patient_user_id))
  with check (auth.uid() = dietitian_user_id and public.is_dietitian_for(patient_user_id));
