-- Columns needed by the offline sync (workoutSync.js): soft delete + extra workout fields.
alter table public.user_workouts
  add column if not exists updated_at   timestamptz not null default now(),
  add column if not exists deleted_at   timestamptz,
  add column if not exists duration_min numeric,
  add column if not exists notes        text,
  add column if not exists mood         text;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists user_workouts_set_updated_at on public.user_workouts;
create trigger user_workouts_set_updated_at
  before update on public.user_workouts
  for each row execute function public.set_updated_at();
