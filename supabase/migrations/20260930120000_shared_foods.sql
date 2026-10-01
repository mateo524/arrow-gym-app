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
