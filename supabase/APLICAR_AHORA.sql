-- APLICAR EN: https://supabase.com/dashboard/project/wesexsgrtkhimpxnwysf/sql/new
-- Pegar TODO y ejecutar una sola vez. Orden ya resuelto. Idempotente (se puede volver a correr).

-- ======= 20260930120000_shared_foods.sql =======
-- Catálogo compartido de alimentos: lo que un usuario crea en "Comidas" queda
-- disponible para todos los demás. Valores siempre POR 100 g.
-- No expone quién lo creó: el cliente nunca selecciona created_by.

create extension if not exists pg_trgm;

create table if not exists public.shared_foods (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(btrim(name)) between 2 and 80),
  name_key    text generated always as (lower(btrim(name))) stored,
  kcal        numeric(6,1) not null check (kcal >= 0 and kcal <= 900),
  protein     numeric(5,1) not null default 0 check (protein >= 0 and protein <= 100),
  carbs       numeric(5,1) not null default 0 check (carbs   >= 0 and carbs   <= 100),
  fat         numeric(5,1) not null default 0 check (fat     >= 0 and fat     <= 100),
  created_by  uuid default auth.uid() references auth.users(id) on delete set null,
  hidden      boolean not null default false,
  created_at  timestamptz not null default now(),
  -- proteína + carbs + grasa no pueden superar los 100 g de alimento
  constraint shared_foods_macros_le_100 check (protein + carbs + fat <= 100.5)
);

create unique index if not exists shared_foods_name_key_uidx on public.shared_foods (name_key);
create index if not exists shared_foods_name_trgm_idx on public.shared_foods using gin (name gin_trgm_ops);

alter table public.shared_foods enable row level security;

-- Cualquier usuario logueado puede buscar (salvo lo oculto por moderación)
drop policy if exists "Shared foods are readable by authenticated users" on public.shared_foods;
create policy "Shared foods are readable by authenticated users"
  on public.shared_foods for select
  to authenticated
  using (hidden = false);

-- Cualquier usuario logueado puede agregar alimentos, siempre a su nombre
drop policy if exists "Users add shared foods as themselves" on public.shared_foods;
create policy "Users add shared foods as themselves"
  on public.shared_foods for insert
  to authenticated
  with check (created_by = auth.uid() and hidden = false);

-- Sin UPDATE/DELETE para usuarios: la moderación se hace con service role o desde el panel admin.

-- ======= 20260930130000_security_hardening.sql =======
-- Security hardening (idempotente).

-- 1) is_admin(): evita recursión de RLS al consultar profiles desde sus propias policies
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin','superadmin')
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, service_role;

-- 2) handle_new_user: el rol ya NO se lee de raw_user_meta_data (lo controla el cliente en signUp).
-- Solo se acepta raw_app_meta_data->>'role', que únicamente puede escribir el service role / Admin API.
-- Se parchea la función existente para conservar cualquier otra lógica que tenga la base real.
do $$
declare
  fn text;
begin
  select pg_get_functiondef('public.handle_new_user()'::regprocedure) into fn;
  fn := replace(fn, 'raw_user_meta_data->>''role''', 'raw_app_meta_data->>''role''');
  if fn like '%raw_user_meta_data->>''role''%' then
    raise warning 'handle_new_user todavía lee el rol de raw_user_meta_data: revisala a mano';
  end if;
  execute fn;
end $$;

-- 3) Bloquea la escalada de privilegios vía UPDATE directo desde el cliente.
-- Solo restringe a los roles de API (authenticated/anon). service_role, postgres y las
-- funciones SECURITY DEFINER (invitaciones, aprobación de trainer) siguen pudiendo cambiarlos.
-- to_jsonb(new) evita fallar si subscription_* aún no existe en este entorno.
create or replace function public.profiles_protect_privileged_cols()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    if new.role is distinct from old.role
       or new.trainer_id is distinct from old.trainer_id
       or (to_jsonb(new)->'subscription_status')     is distinct from (to_jsonb(old)->'subscription_status')
       or (to_jsonb(new)->'subscription_expires_at') is distinct from (to_jsonb(old)->'subscription_expires_at')
    then
      raise exception 'No autorizado a modificar role, trainer_id o suscripción'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_privileged_cols on public.profiles;
create trigger profiles_protect_privileged_cols
  before update on public.profiles
  for each row execute function public.profiles_protect_privileged_cols();

-- 4) Índices en FK / columnas de filtro frecuentes
create index if not exists profiles_trainer_id_idx       on public.profiles (trainer_id);
create index if not exists routines_user_id_idx          on public.routines (user_id);
create index if not exists routines_trainer_id_idx       on public.routines (trainer_id);
create index if not exists user_workouts_user_date_idx   on public.user_workouts (user_id, date desc);

-- 5) El entrenador lee los workouts de sus alumnos
drop policy if exists "Trainers can read their students workouts" on public.user_workouts;
create policy "Trainers can read their students workouts"
  on public.user_workouts for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = user_workouts.user_id and p.trainer_id = auth.uid()
    )
  );

-- ======= 20260930150000_sync_columns.sql =======
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

-- ======= 20260930160000_moderation_support.sql =======
-- Moderación de alimentos compartidos, soporte y auditoría de acciones admin.

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','superadmin'));
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Reportes de alimentos: cualquiera logueado reporta, solo admin lee/gestiona
create table if not exists public.food_reports (
  id          uuid primary key default gen_random_uuid(),
  food_id     uuid not null references public.shared_foods(id) on delete cascade,
  reporter_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  reason      text not null check (char_length(btrim(reason)) between 3 and 300),
  resolved    boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (food_id, reporter_id)
);
create index if not exists food_reports_food_idx on public.food_reports (food_id);
alter table public.food_reports enable row level security;

drop policy if exists "Users report foods as themselves" on public.food_reports;
create policy "Users report foods as themselves" on public.food_reports
  for insert to authenticated with check (reporter_id = auth.uid());
drop policy if exists "Admins read reports" on public.food_reports;
create policy "Admins read reports" on public.food_reports
  for select to authenticated using (public.is_admin());
drop policy if exists "Admins update reports" on public.food_reports;
create policy "Admins update reports" on public.food_reports
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins delete reports" on public.food_reports;
create policy "Admins delete reports" on public.food_reports
  for delete to authenticated using (public.is_admin());

-- Admin ve también los alimentos ocultos (para restaurarlos)
drop policy if exists "Admins read all shared foods" on public.shared_foods;
create policy "Admins read all shared foods" on public.shared_foods
  for select to authenticated using (public.is_admin());

-- Auditoría de acciones admin (append-only: sin UPDATE/DELETE)
create table if not exists public.admin_audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid default auth.uid() references auth.users(id) on delete set null,
  action      text not null check (char_length(action) between 2 and 60),
  target_type text,
  target_id   text,
  details     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists admin_audit_log_created_idx on public.admin_audit_log (created_at desc);
alter table public.admin_audit_log enable row level security;

drop policy if exists "Admins read audit log" on public.admin_audit_log;
create policy "Admins read audit log" on public.admin_audit_log
  for select to authenticated using (public.is_admin());
drop policy if exists "Admins write audit log" on public.admin_audit_log;
create policy "Admins write audit log" on public.admin_audit_log
  for insert to authenticated with check (public.is_admin() and actor_id = auth.uid());

-- Tickets de soporte
create table if not exists public.support_tickets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  subject    text not null check (char_length(btrim(subject)) between 3 and 120),
  message    text not null check (char_length(btrim(message)) between 5 and 2000),
  status     text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now(),
  closed_at  timestamptz
);
create index if not exists support_tickets_user_idx on public.support_tickets (user_id, created_at desc);
alter table public.support_tickets enable row level security;

drop policy if exists "Users create own tickets" on public.support_tickets;
create policy "Users create own tickets" on public.support_tickets
  for insert to authenticated with check (user_id = auth.uid() and status = 'open');
drop policy if exists "Users read own tickets" on public.support_tickets;
create policy "Users read own tickets" on public.support_tickets
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "Admins read tickets" on public.support_tickets;
create policy "Admins read tickets" on public.support_tickets
  for select to authenticated using (public.is_admin());
drop policy if exists "Admins update tickets" on public.support_tickets;
create policy "Admins update tickets" on public.support_tickets
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Ocultar / restaurar un alimento compartido (solo admin), con registro en auditoría
create or replace function public.admin_set_shared_food_hidden(p_food_id uuid, p_hidden boolean, p_reason text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  update public.shared_foods set hidden = p_hidden where id = p_food_id;
  if not found then raise exception 'Alimento inexistente'; end if;
  if p_hidden then
    update public.food_reports set resolved = true where food_id = p_food_id;
  end if;
  insert into public.admin_audit_log (actor_id, action, target_type, target_id, details)
  values (auth.uid(), case when p_hidden then 'food_hide' else 'food_restore' end, 'shared_food', p_food_id::text,
          jsonb_build_object('reason', p_reason));
end;
$$;
revoke all on function public.admin_set_shared_food_hidden(uuid, boolean, text) from public, anon;
grant execute on function public.admin_set_shared_food_hidden(uuid, boolean, text) to authenticated;

-- ======= 20260930180000_live_schema_fixes.sql =======
-- Correcciones para que la base real coincida con lo que usa la app.

-- 1) El onboarding guarda el sexo (se usa para el cálculo de calorías)
alter table public.profiles
  add column if not exists sex text check (sex in ('M', 'F'));

-- 2) respond_trainer_request inserta en trainer_clients, que no existía: aceptar un alumno fallaba
create table if not exists public.trainer_clients (
  trainer_id uuid not null references public.profiles(id) on delete cascade,
  client_id  uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (trainer_id, client_id)
);
create index if not exists trainer_clients_client_idx on public.trainer_clients (client_id);
alter table public.trainer_clients enable row level security;

drop policy if exists "Trainer or client reads own link" on public.trainer_clients;
create policy "Trainer or client reads own link" on public.trainer_clients
  for select to authenticated
  using (trainer_id = auth.uid() or client_id = auth.uid() or public.is_admin());
-- Sin políticas de escritura: solo las funciones SECURITY DEFINER (respond_trainer_request) insertan.

-- Vínculos que ya existen en profiles.trainer_id
insert into public.trainer_clients (trainer_id, client_id)
select trainer_id, id from public.profiles where trainer_id is not null
on conflict do nothing;
