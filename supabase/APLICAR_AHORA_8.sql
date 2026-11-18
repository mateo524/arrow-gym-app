-- Antropometría: perímetro del muslo (para masa muscular) y columnas que faltaban en el historial.
-- Es seguro correrlo más de una vez.
-- Antes, measurements_log no tenía humerus_cm ni femur_cm, así que el historial de perímetros fallaba en silencio
-- cada vez que se cargaban los diámetros óseos.
alter table public.profiles add column if not exists thigh_cm numeric(5,1);
alter table public.measurements_log add column if not exists thigh_cm numeric(5,1);
alter table public.measurements_log add column if not exists humerus_cm numeric(4,1);
alter table public.measurements_log add column if not exists femur_cm numeric(4,1);
