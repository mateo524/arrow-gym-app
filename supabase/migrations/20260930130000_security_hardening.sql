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
