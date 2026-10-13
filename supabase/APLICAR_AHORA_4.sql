-- APLICAR_AHORA_4: avisos de entrenamiento (horario y "estoy entrenando").
-- Pegar en https://supabase.com/dashboard/project/wesexsgrtkhimpxnwysf/sql/new  y tocar Run. Idempotente.

-- 1) La app marca acá que estás entrenando; el servidor no manda "volvé a entrenar" mientras esté vigente.
alter table public.profiles add column if not exists workout_active_until timestamptz;

-- 2) Un solo aviso por día, a las 20:30 hora Argentina (23:30 UTC), en vez de las 15:00.
select cron.alter_job(5, schedule := '30 23 * * *');   -- daily-reengagement-push

-- 3) Sacar los duplicados / lo que ya no se usa:
select cron.unschedule(3);   -- re-engagement-daily: mandaba el mismo aviso a las 10:00 (duplicado)
select cron.unschedule(1);   -- proactive-coach-daily: usaba IA y ya no funcionaba (faltaba la clave)

-- Verificar:
-- select jobid, jobname, schedule, active from cron.job order by jobid;
