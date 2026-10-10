# Qué pegar en Supabase (en este orden)

Proyecto: `wesexsgrtkhimpxnwysf` · Panel: https://supabase.com/dashboard/project/wesexsgrtkhimpxnwysf

## 1) SQL de seguridad, ronda 2
- Abrí https://supabase.com/dashboard/project/wesexsgrtkhimpxnwysf/sql/new
- Pegá TODO el contenido de `supabase/APLICAR_AHORA_2.sql` → **Run**.
- Qué hace: solo un superadmin cambia roles; `created_by` de los alimentos compartidos deja de ser legible;
  tope diario de altas (30) y de reportes (20); rechaza nombres con caracteres invisibles; arregla `handle_new_user`.
- Verificar: crear un alimento nuevo desde la app y buscarlo; tiene que aparecer.

## 2) SQL de fotos de progreso privadas
- Mismo editor: https://supabase.com/dashboard/project/wesexsgrtkhimpxnwysf/sql/new
- Pegá TODO `supabase/APLICAR_AHORA_3.sql` → **Run**. (El sitio ya muestra las fotos con URL firmada.)
- Verificar: Mediciones > Fotos sigue mostrando tus fotos.

## 3) Función `create-user` (hueco: un entrenador podía crear un superadmin)
- https://supabase.com/dashboard/project/wesexsgrtkhimpxnwysf/functions → **create-user** → pestaña de código.
- Reemplazá todo por el contenido de `supabase/functions/create-user/index.ts` → **Deploy**.
- Dejá "Verify JWT" activado.
- Verificar: desde el panel de admin crear un alumno y un entrenador; tienen que seguir funcionando.

## 4) Funciones `ai-coach` y `testamento-coach` (hueco: cualquiera con la clave pública lee datos de otros)
Activar "Verify JWT" NO alcanza (la clave pública también es un JWT válido). Hay que validar quién llama.

En https://supabase.com/dashboard/project/wesexsgrtkhimpxnwysf/functions abrí cada función y pegá el bloque
justo después de leer el body (donde hoy hace `const { user_id } = body;` / `const { trainer_id, student_id, question } = await req.json();`)
y antes de crear el cliente de servicio.

### ai-coach (después de validar que `user_id` existe)
```ts
// --- Seguridad: solo la propia persona, su entrenador, un admin, o una llamada interna (service role) ---
{
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const isInternal = token !== "" && token === serviceKey;
  if (!isInternal) {
    const caller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY") ?? "", { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data: { user } } = await caller.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    if (user.id !== user_id) {
      const admin = createClient(url, serviceKey);
      const { data: me } = await admin.from("profiles").select("role").eq("id", user.id).single();
      const { data: target } = await admin.from("profiles").select("trainer_id").eq("id", user_id).single();
      const allowed = me?.role === "admin" || me?.role === "superadmin" || (me?.role === "trainer" && target?.trainer_id === user.id);
      if (!allowed) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    }
  }
}
```

### testamento-coach (después de validar `trainer_id` y `question`)
```ts
// --- Seguridad: el alumno de ese entrenador, el propio entrenador, un admin, o una llamada interna ---
{
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const isInternal = token !== "" && token === serviceKey;
  if (!isInternal) {
    const caller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY") ?? "", { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data: { user } } = await caller.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
    const admin = createClient(url, serviceKey);
    const { data: me } = await admin.from("profiles").select("role, trainer_id").eq("id", user.id).single();
    const allowed =
      user.id === trainer_id ||
      me?.role === "admin" || me?.role === "superadmin" ||
      (user.id === student_id && me?.trainer_id === trainer_id);
    if (!allowed) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { "Content-Type": "application/json" } });
  }
}
```
Si en el código ya existe una variable `cors`, usala en los headers (en testamento-coach agregala si falta).
- Verificar: la app (Coach / Testamento) sigue respondiendo con tu cuenta; una llamada sin sesión da 401.

## 5) Cosas del panel (sin código)
- **Revocar el token que pasaste por el chat:** https://supabase.com/dashboard/account/tokens
- **Backups:** https://supabase.com/dashboard/project/wesexsgrtkhimpxnwysf/database/backups (confirmá que estén activos).
- **Verificar RLS en todas las tablas:** https://supabase.com/dashboard/project/wesexsgrtkhimpxnwysf/database/tables (ninguna con RLS desactivado).
- **Auth > Políticas:** https://supabase.com/dashboard/project/wesexsgrtkhimpxnwysf/auth/policies
- **Auth > URL (redirecciones):** https://supabase.com/dashboard/project/wesexsgrtkhimpxnwysf/auth/url-configuration
  → Site URL `https://arrow-gym-project.vercel.app`.
