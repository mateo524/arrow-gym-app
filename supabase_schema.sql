-- Arrow Gym – Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query

-- ─── PROFILES ──────────────────────────────────────────────────────────────
-- Extends auth.users with role + trainer assignment
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  email       text,
  role        text not null default 'user'  -- 'superadmin' | 'admin' | 'trainer' | 'user'
                check (role in ('superadmin','admin','trainer','user')),
  trainer_id      uuid references public.profiles(id) on delete set null,
  -- Body stats (for Coach AI recommendations)
  weight_kg       numeric,
  height_cm       numeric,
  age             integer,
  -- Per-user flags
  shoulder_alert  boolean default false,  -- enable shoulder post-op alerts for this user
  created_at      timestamptz default now()
);

-- Auto-create a basic profile on signup (useful for admin-created accounts)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── ROUTINES ───────────────────────────────────────────────────────────────
-- Trainer-created routines assigned to a specific user
create table if not exists public.routines (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  trainer_id  uuid references public.profiles(id) on delete set null,
  name        text not null,
  exercises   jsonb not null default '[]',
  -- exercises format:
  -- [{ "name": "Press Banca", "sets": 4, "reps": "8-10", "notes": "Agarre ancho" }, ...]
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists routines_updated_at on public.routines;
create trigger routines_updated_at
  before update on public.routines
  for each row execute procedure public.set_updated_at();

-- ─── USER WORKOUTS ──────────────────────────────────────────────────────────
-- Stores completed workouts per user – synced from the app after each session
create table if not exists public.user_workouts (
  id          text primary key,        -- matches the client-side uid
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text,                    -- 'Push', 'Pull', 'Legs', 'Full Body', etc.
  date        text,                    -- ISO date string YYYY-MM-DD
  sets        jsonb not null default '[]',
  -- sets format:
  -- [{ "exercise": "Press Banca", "weight": 80, "reps": 10, "group": "Pecho", ... }, ...]
  created_at  timestamptz default now()
);

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.routines       enable row level security;
alter table public.user_workouts  enable row level security;

-- PROFILES policies
create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Trainers can read their clients"
  on public.profiles for select
  using (
    trainer_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin','superadmin')
    )
  );

create policy "Admins can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin','superadmin')
    )
  );

create policy "Admins can insert profiles"
  on public.profiles for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin','superadmin')
    )
  );

create policy "Admins can update profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin','superadmin')
    )
  );

create policy "Admins can delete profiles"
  on public.profiles for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin','superadmin')
    )
  );

-- ROUTINES policies
create policy "Users see their own routines"
  on public.routines for select
  using (user_id = auth.uid());

create policy "Trainers see routines they created"
  on public.routines for select
  using (trainer_id = auth.uid());

create policy "Admins see all routines"
  on public.routines for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin','superadmin')
    )
  );

create policy "Trainers can create routines for their clients"
  on public.routines for insert
  with check (
    trainer_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin','superadmin')
    )
  );

create policy "Trainers can update their routines"
  on public.routines for update
  using (
    trainer_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin','superadmin')
    )
  );

create policy "Trainers can delete their routines"
  on public.routines for delete
  using (
    trainer_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin','superadmin')
    )
  );

-- WORKOUTS policies
create policy "Users manage their own workouts"
  on public.user_workouts for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Admins can read all workouts"
  on public.user_workouts for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin','superadmin')
    )
  );

-- ─── MAKE YOURSELF SUPERADMIN ───────────────────────────────────────────────
-- After signing up for the first time, run this once replacing YOUR_EMAIL:
--
-- update public.profiles
-- set role = 'superadmin'
-- where email = 'YOUR_EMAIL@example.com';
--
-- ────────────────────────────────────────────────────────────────────────────

-- ─── GROUP ROUTINES MIGRATION ───────────────────────────────────────────────
-- Run this after the schema to enable group routines (trainer → all clients)
--
-- alter table public.routines
--   add column if not exists group_id uuid references public.profiles(id) on delete cascade;
--
-- create policy "Users can see group routines from their trainer"
--   on public.routines for select
--   using (
--     exists (
--       select 1 from public.profiles p
--       where p.id = auth.uid()
--       and p.trainer_id = routines.user_id
--       and routines.notes like '[GRUPO:%'
--     )
--   );

-- ─── HEALTH DATA MIGRATION ────────────────────────────────────────────────────
-- Column for storing all health/diary data (weight log, meals, sleep, water, etc.)
-- Run this in Supabase SQL Editor:
--
-- alter table public.profiles
--   add column if not exists health_data jsonb default '{}';
--
-- Then update the RLS policy so users can update their own health_data:
--
-- create policy "Users can update their own health_data"
--   on public.profiles for update
--   using (auth.uid() = id)
--   with check (auth.uid() = id);
