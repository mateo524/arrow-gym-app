-- Pagos de MercadoPago (pago mensual de 30 días, sin débito automático).
-- Idempotencia: payment_id (de MP) es la clave primaria.

alter table public.profiles
  add column if not exists subscription_cancel_at_period_end boolean not null default false;

create table if not exists public.payments (
  payment_id  bigint primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  amount      numeric(12,2) not null check (amount > 0),
  currency    text not null default 'ARS',
  status      text not null default 'approved',
  raw         jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists payments_user_idx on public.payments (user_id, created_at desc);

alter table public.payments enable row level security;

-- Lectura propia; sin políticas de escritura (solo service role)
drop policy if exists "Users read own payments" on public.payments;
create policy "Users read own payments"
  on public.payments for select
  to authenticated
  using (user_id = auth.uid());

-- Aplica un pago de forma atómica e idempotente. true = se aplicó ahora,
-- false = ya estaba procesado (reintento de MP).
create or replace function public.apply_mp_payment(
  p_payment_id bigint, p_user_id uuid, p_amount numeric,
  p_currency text, p_days int, p_raw jsonb
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted int;
begin
  insert into public.payments (payment_id, user_id, amount, currency, raw)
  values (p_payment_id, p_user_id, p_amount, p_currency, p_raw)
  on conflict (payment_id) do nothing;
  get diagnostics inserted = row_count;
  if inserted = 0 then return false; end if;

  update public.profiles
     set subscription_status = 'active',
         subscription_expires_at =
           greatest(now(), coalesce(subscription_expires_at, now())) + make_interval(days => p_days),
         subscription_cancel_at_period_end = false
   where id = p_user_id;
  if not found then
    raise exception 'profile % not found', p_user_id;  -- revierte el insert; MP reintenta
  end if;
  return true;
end;
$$;

revoke all on function public.apply_mp_payment(bigint, uuid, numeric, text, int, jsonb) from public, anon, authenticated;
grant execute on function public.apply_mp_payment(bigint, uuid, numeric, text, int, jsonb) to service_role;
