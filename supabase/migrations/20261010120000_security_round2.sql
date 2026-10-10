-- Security round 2 (idempotente: se puede correr varias veces).
--
-- QUÉ PEGA EL DUEÑO: este archivo completo (o supabase/APLICAR_AHORA_2.sql, es idéntico) en
--   https://supabase.com/dashboard/project/wesexsgrtkhimpxnwysf/sql/new
-- Requiere que las migraciones anteriores (shared_foods, security_hardening, moderation_support) ya estén aplicadas.
--
-- QUÉ VERIFICAR DESPUÉS (SQL Editor, o con un usuario real desde la app):
--  1) Un 'admin' (no superadmin) NO puede ascender a nadie ni a sí mismo:
--       update public.profiles set role='superadmin' where id = auth.uid();  --> ERROR 42501
--     Un superadmin sí puede cambiar roles. service_role / postgres / funciones SECURITY DEFINER siguen pudiendo.
--  2) Un usuario logueado puede publicar un alimento (insert con created_by = auth.uid()) y buscarlo, pero
--       select created_by from public.shared_foods;  --> ERROR "permission denied for column created_by"
--     Si la búsqueda (select id,name,kcal,protein,carbs,fat) falla con "permission denied", la policy
--     "hidden = false" estaría exigiendo la columna hidden: avisar (rollback abajo).
--  3) El alta nº 31 del día de un mismo usuario falla con mensaje 'cuota diaria'; el reporte nº 21 también.
--  4) Un nombre con U+202E / U+200B / caracteres de control es rechazado (constraint shared_foods_name_clean).
--  5) Signup de un usuario nuevo sigue creando su profile (handle_new_user).
--  Rollback columnas:  grant select on public.shared_foods to authenticated;

-- ═══ 0) Helpers ═══════════════════════════════════════════════════════════════
create or replace function public.is_superadmin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'superadmin');
$$;
revoke all on function public.is_superadmin() from public, anon;
grant execute on function public.is_superadmin() to authenticated, service_role;

-- ═══ 1) Solo un superadmin puede cambiar `role` ═══════════════════════════════
-- Reemplaza la función del trigger existente (security_hardening). Solo restringe a los roles de API
-- (authenticated/anon); service_role, postgres y funciones SECURITY DEFINER no se ven afectados.
create or replace function public.profiles_protect_privileged_cols()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('authenticated', 'anon') then
    -- role: SOLO superadmin (un admin no puede ascender a superadmin ni a sí mismo)
    if new.role is distinct from old.role and not public.is_superadmin() then
      raise exception 'Solo un superadmin puede modificar el rol'
        using errcode = '42501';
    end if;
    -- trainer_id / suscripción: admin o superadmin
    if not public.is_admin() then
      if new.trainer_id is distinct from old.trainer_id
         or (to_jsonb(new)->'subscription_status')     is distinct from (to_jsonb(old)->'subscription_status')
         or (to_jsonb(new)->'subscription_expires_at') is distinct from (to_jsonb(old)->'subscription_expires_at')
      then
        raise exception 'No autorizado a modificar trainer_id o suscripción'
          using errcode = '42501';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_privileged_cols on public.profiles;
create trigger profiles_protect_privileged_cols
  before update on public.profiles
  for each row execute function public.profiles_protect_privileged_cols();

-- Mismo cierre en INSERT: la policy "Admins can insert profiles" permitiría crear un perfil superadmin.
create or replace function public.profiles_protect_role_on_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('authenticated', 'anon')
     and new.role in ('admin', 'superadmin')
     and not public.is_superadmin() then
    raise exception 'Solo un superadmin puede crear perfiles admin/superadmin'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role_on_insert on public.profiles;
create trigger profiles_protect_role_on_insert
  before insert on public.profiles
  for each row execute function public.profiles_protect_role_on_insert();

-- handle_new_user: rol 'user' fijo (nunca desde metadata) y search_path vacío (todo calificado).
-- Los roles elevados se asignan después, solo por un superadmin / service_role.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ═══ 2) shared_foods ══════════════════════════════════════════════════════════
-- 2a) created_by deja de ser legible por usuarios (privacidad). Las policies siguen funcionando:
--     el INSERT solo necesita privilegio INSERT (WITH CHECK created_by = auth.uid()) y el cliente
--     no pide created_by en returning (insert sin .select()).
revoke select on public.shared_foods from authenticated, anon;
grant select (id, name, kcal, protein, carbs, fat, created_at) on public.shared_foods to authenticated;
-- `hidden` NO es sensible (la policy ya oculta esas filas a no-admins) y el panel admin
-- (AdminPage: food_reports -> food:food_id(... hidden)) la lee por la API: sin este grant se rompería.
grant select (hidden) on public.shared_foods to authenticated;

-- 2a') Alta robusta: created_by y hidden los fija un trigger (SECURITY DEFINER) y la policy de INSERT
--      ya no lee columnas con permiso revocado (evita "permission denied for column created_by").
create or replace function public.shared_foods_set_defaults()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if current_user in ('authenticated', 'anon') then
    new.created_by := auth.uid();
    new.hidden := false;
  end if;
  return new;
end;
$$;
revoke all on function public.shared_foods_set_defaults() from public, anon, authenticated;

drop trigger if exists shared_foods_set_defaults on public.shared_foods;
create trigger shared_foods_set_defaults
  before insert on public.shared_foods
  for each row execute function public.shared_foods_set_defaults();

drop policy if exists "Users add shared foods as themselves" on public.shared_foods;
create policy "Users add shared foods as themselves" on public.shared_foods
  for insert to authenticated
  with check (auth.uid() is not null);

-- Para el panel admin: autor y estado de un alimento (created_by/hidden ya no se leen por la API).
create or replace function public.admin_shared_food_meta(p_food_id uuid)
returns table (created_by uuid, hidden boolean)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  return query select f.created_by, f.hidden from public.shared_foods f where f.id = p_food_id;
end;
$$;
revoke all on function public.admin_shared_food_meta(uuid) from public, anon;
grant execute on function public.admin_shared_food_meta(uuid) to authenticated;

-- 2b) Nombres sin caracteres bidi / ancho cero / control (afecta altas y ediciones nuevas;
--     NOT VALID no revalida filas viejas: revisalas con la query del final).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'shared_foods_name_clean'
                 and conrelid = 'public.shared_foods'::regclass) then
    alter table public.shared_foods add constraint shared_foods_name_clean
      check (name !~ '[\u0001-\u001f\u007f-\u009f\u00ad\u061c\u180e\u200b-\u200f\u2028-\u202e\u2060-\u2064\u2066-\u2069\ufeff]')
      not valid;
  end if;
end $$;

-- 2c) Cuota de altas por usuario: 30 cada 24 h. SECURITY DEFINER porque lee created_by (revocado).
create index if not exists shared_foods_creator_created_idx on public.shared_foods (created_by, created_at desc);

create or replace function public.shared_foods_enforce_quota()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare n int;
begin
  if current_user in ('authenticated', 'anon') and new.created_by is not null then
    perform pg_advisory_xact_lock(hashtext('shared_foods_quota:' || new.created_by::text));
    select count(*) into n from public.shared_foods f
     where f.created_by = new.created_by and f.created_at > now() - interval '24 hours';
    if n >= 30 then
      raise exception 'Llegaste a la cuota diaria de alimentos compartidos (30). Probá mañana.'
        using errcode = 'P0001', hint = 'quota_exceeded';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.shared_foods_enforce_quota() from public, anon, authenticated;

drop trigger if exists shared_foods_enforce_quota on public.shared_foods;
create trigger shared_foods_enforce_quota
  before insert on public.shared_foods
  for each row execute function public.shared_foods_enforce_quota();

-- ═══ 3) food_reports: 20 reportes/24 h por usuario y el alimento debe existir y estar visible ═══
create index if not exists food_reports_reporter_created_idx on public.food_reports (reporter_id, created_at desc);

create or replace function public.food_reports_enforce_limits()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare n int;
begin
  if current_user in ('authenticated', 'anon') then
    if not exists (select 1 from public.shared_foods f where f.id = new.food_id and f.hidden = false) then
      raise exception 'El alimento reportado no existe' using errcode = 'P0002';
    end if;
    perform pg_advisory_xact_lock(hashtext('food_reports_quota:' || new.reporter_id::text));
    select count(*) into n from public.food_reports r
     where r.reporter_id = new.reporter_id and r.created_at > now() - interval '24 hours';
    if n >= 20 then
      raise exception 'Llegaste al límite diario de reportes (20). Probá mañana.'
        using errcode = 'P0001', hint = 'quota_exceeded';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.food_reports_enforce_limits() from public, anon, authenticated;

drop trigger if exists food_reports_enforce_limits on public.food_reports;
create trigger food_reports_enforce_limits
  before insert on public.food_reports
  for each row execute function public.food_reports_enforce_limits();

-- Revisión manual opcional: nombres viejos que violan la regla de caracteres
--   select id, name from public.shared_foods
--   where name ~ '[\u0001-\u001f\u007f-\u009f\u00ad\u061c\u180e\u200b-\u200f\u2028-\u202e\u2060-\u2064\u2066-\u2069\ufeff]';
