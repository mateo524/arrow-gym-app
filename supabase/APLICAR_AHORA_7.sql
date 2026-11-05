-- Registrar cobro (panel entrenador): guarda también el monto cobrado.
-- Es seguro correrlo más de una vez. Mientras no se corra, la app sigue funcionando
-- (registra las fechas de cobro pero no el monto).
-- Las columnas viven en public.profiles, así que quedan cubiertas por las mismas políticas RLS y el mismo
-- trigger de protección que ya usa el entrenador para actualizar a sus alumnos (no se agrega ninguna política nueva).
alter table public.profiles add column if not exists last_payment_date date;
alter table public.profiles add column if not exists next_payment_date date;
alter table public.profiles add column if not exists last_payment_amount numeric(12,2);
alter table public.profiles drop constraint if exists profiles_last_payment_amount_check;
alter table public.profiles add constraint profiles_last_payment_amount_check
  check (last_payment_amount is null or last_payment_amount > 0);
