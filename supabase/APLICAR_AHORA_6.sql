-- Alimentos compartidos: unidad de medida (g o ml). Los líquidos se cargan y muestran en ml.
-- Es seguro correrlo más de una vez. Mientras no se corra, la app sigue funcionando (los líquidos compartidos se ven en gramos).
alter table public.shared_foods add column if not exists unit text not null default 'g';
alter table public.shared_foods drop constraint if exists shared_foods_unit_check;
alter table public.shared_foods add constraint shared_foods_unit_check check (unit in ('g', 'ml'));
