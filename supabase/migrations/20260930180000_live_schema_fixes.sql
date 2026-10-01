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
