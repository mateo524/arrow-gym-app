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
