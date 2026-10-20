-- Pegar en https://supabase.com/dashboard/project/wesexsgrtkhimpxnwysf/sql/new  y tocar Run. Idempotente.

-- Modo vacaciones: la app guarda acá hasta qué día está de vacaciones (null = no).
-- Los avisos del servidor (volvé a entrenar, resumen semanal) se saltean mientras esté vigente.
alter table public.profiles add column if not exists vacation_until date;
