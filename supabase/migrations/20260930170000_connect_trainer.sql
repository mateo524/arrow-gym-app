-- Un alumno se conecta a un entrenador con su código de invitación.
-- Necesario porque el trigger de seguridad impide que el cliente cambie profiles.trainer_id directamente.
create or replace function public.connect_to_trainer(p_invite_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_trainer public.profiles%rowtype;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  select * into v_trainer
  from public.profiles
  where invite_code = upper(btrim(p_invite_code))
    and role = 'trainer'
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'invalid_code');
  end if;
  if v_trainer.id = auth.uid() then
    return jsonb_build_object('ok', false, 'error', 'self');
  end if;

  insert into public.trainer_clients (trainer_id, client_id)
  values (v_trainer.id, auth.uid())
  on conflict (trainer_id, client_id) do nothing;

  -- security definer corre como owner: el trigger anti-escalada debe permitirlo (ver security_hardening)
  update public.profiles set trainer_id = v_trainer.id where id = auth.uid();

  return jsonb_build_object('ok', true, 'trainer_name', v_trainer.name);
end;
$$;

revoke all on function public.connect_to_trainer(text) from public, anon;
grant execute on function public.connect_to_trainer(text) to authenticated;
