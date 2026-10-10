-- APLICAR_AHORA_3: fotos de progreso privadas.
--
-- ORDEN IMPORTANTE: pegar esto DESPUÉS de que el sitio nuevo esté publicado (ya lo está: la app
-- muestra las fotos con URL firmada, tanto las nuevas como las viejas). Si se pega antes, las fotos
-- de quien tenga abierta la versión vieja de la app dejan de verse hasta que recargue.
--
-- DÓNDE: https://supabase.com/dashboard/project/wesexsgrtkhimpxnwysf/sql/new   (pegar todo y Run)
-- Idempotente: se puede volver a correr.
--
-- VERIFICAR DESPUÉS: abrí la app > Mediciones > Fotos: tus fotos tienen que seguir viéndose.
-- La URL vieja pública (.../object/public/progress-photos/...) tiene que dar error al abrirla en una
-- ventana de incógnito.
-- ROLLBACK (si algo falla): update storage.buckets set public = true where id = 'progress-photos';

-- 1) Bucket privado
update storage.buckets set public = false where id = 'progress-photos';

-- 2) Sacar cualquier política de lectura previa sobre este bucket (la pública incluida)
do $$
declare r record;
begin
  for r in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and cmd = 'SELECT'
      and qual ilike '%progress-photos%'
  loop
    execute format('drop policy %I on storage.objects', r.policyname);
  end loop;
end $$;

-- 3) Lectura: la persona dueña de la foto, su entrenador y los admins
drop policy if exists "Progress photos read owner trainer admin" on storage.objects;
create policy "Progress photos read owner trainer admin"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'progress-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.profiles p
        where p.id::text = (storage.foldername(name))[1] and p.trainer_id = auth.uid()
      )
      or public.is_admin()
    )
  );

-- Las políticas de subir y borrar la propia foto (migración 20260919) siguen igual.
