# Qué pegar en Supabase (en este orden)

Proyecto: `wesexsgrtkhimpxnwysf` · Panel: https://supabase.com/dashboard/project/wesexsgrtkhimpxnwysf

## 1) SQL de seguridad, ronda 2  (YA APLICADO y verificado)
- Abrí https://supabase.com/dashboard/project/wesexsgrtkhimpxnwysf/sql/new
- Pegá TODO el contenido de `supabase/APLICAR_AHORA_2.sql` → **Run**.
- Qué hace: solo un superadmin cambia roles; `created_by` de los alimentos compartidos deja de ser legible;
  tope diario de altas (30) y de reportes (20); rechaza nombres con caracteres invisibles; arregla `handle_new_user`.
- Verificar: crear un alimento nuevo desde la app y buscarlo; tiene que aparecer.

## 2) SQL de fotos de progreso privadas  (YA APLICADO y verificado)
- Mismo editor: https://supabase.com/dashboard/project/wesexsgrtkhimpxnwysf/sql/new
- Pegá TODO `supabase/APLICAR_AHORA_3.sql` → **Run**. (El sitio ya muestra las fotos con URL firmada.)
- Verificar: Mediciones > Fotos sigue mostrando tus fotos.

## 3) Función `create-user` (hueco: un entrenador podía crear un superadmin)
- https://supabase.com/dashboard/project/wesexsgrtkhimpxnwysf/functions → **create-user** → pestaña de código.
- Reemplazá todo por el contenido de `supabase/functions/create-user/index.ts` → **Deploy**.
- Dejá "Verify JWT" activado.
- Verificar: desde el panel de admin crear un alumno y un entrenador; tienen que seguir funcionando.

## 4) Funciones de IA: BORRARLAS (decisión: la app no usa IA)
`ai-coach` y `testamento-coach` aceptaban el `user_id` / `trainer_id` del pedido y usaban la clave de servicio sin verificar
quién llama: cualquiera con la clave pública de la app podía leer datos de otro usuario. Verificado (solo lectura):
ninguna otra función ni tarea programada las llama, así que se pueden borrar sin romper nada.
- https://supabase.com/dashboard/project/wesexsgrtkhimpxnwysf/functions → `ai-coach` → ⋯ / Settings → **Delete function**.
- Lo mismo con `testamento-coach`.
- Borrar también el secreto `Gemini API Key`: https://supabase.com/dashboard/project/wesexsgrtkhimpxnwysf/functions/secrets
- Ya no hace falta Google Cloud para esta app (se puede cerrar la facturación de Google).

## 5) Cosas del panel (sin código)
- **Revocar el token que pasaste por el chat:** https://supabase.com/dashboard/account/tokens
- **Backups:** https://supabase.com/dashboard/project/wesexsgrtkhimpxnwysf/database/backups (confirmá que estén activos).
- **Verificar RLS en todas las tablas:** https://supabase.com/dashboard/project/wesexsgrtkhimpxnwysf/database/tables (ninguna con RLS desactivado).
- **Auth > Políticas:** https://supabase.com/dashboard/project/wesexsgrtkhimpxnwysf/auth/policies
- **Auth > URL (redirecciones):** https://supabase.com/dashboard/project/wesexsgrtkhimpxnwysf/auth/url-configuration
  → Site URL `https://arrow-gym-project.vercel.app`.
