// delete-account: el propio usuario elimina su cuenta y sus datos (ProfilePage -> "Eliminar cuenta").
//
// Solo borra la cuenta de QUIEN LLAMA (el id sale del JWT, nunca del body).
// Orden: datos en tablas -> archivos de storage -> usuario de Auth -> perfil.
// Las tablas se limpian "best effort": si una tabla/columna no existe en esta base se ignora;
// las que tienen FK con ON DELETE CASCADE hacia auth.users/profiles se borran solas al final.
//
// DESPLIEGUE (manual): Supabase Dashboard > Edge Functions > delete-account > pegar este código > Deploy.
// Mantener "Verify JWT" activado. Definir el secret ALLOWED_ORIGIN (URL de la app, ej. https://app.ejemplo.com).
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
  "Content-Type": "application/json",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: corsHeaders });

// [tabla, columna que apunta al usuario]
const OWNED: Array<[string, string]> = [
  ["user_workouts", "user_id"],
  ["routine_assignments", "user_id"],
  ["routines", "user_id"],
  ["measurements", "user_id"],
  ["measurements_log", "user_id"],
  ["weight_log", "user_id"],
  ["notifications", "user_id"],
  ["push_subscriptions", "user_id"],
  ["testamento_responses", "user_id"],
  ["support_tickets", "user_id"],
  ["food_reports", "reporter_id"],
  ["student_referrals", "referrer_id"],
  ["referral_conversions", "trainer_id"],
  ["trainer_role_requests", "user_id"],
  ["trainer_requests", "student_id"],
  ["trainer_requests", "trainer_id"],
  ["trainer_clients", "client_id"],
  ["trainer_clients", "trainer_id"],
  ["invite_codes", "trainer_id"],
  ["trainer_invites", "created_by"],
  ["routine_templates", "trainer_id"],
  ["trainer_notifications", "trainer_id"],
];

const PHOTO_BUCKET = "progress-photos";

// Lista recursivamente los archivos bajo "<prefix>" (las carpetas vienen con id null).
// deno-lint-ignore no-explicit-any
async function listFiles(admin: any, prefix: string, depth = 0): Promise<string[]> {
  if (depth > 4) return [];
  const { data, error } = await admin.storage.from(PHOTO_BUCKET).list(prefix, { limit: 1000 });
  if (error || !data) return [];
  const out: string[] = [];
  for (const item of data) {
    const path = `${prefix}/${item.name}`;
    if (item.id) out.push(path);
    else out.push(...(await listFiles(admin, path, depth + 1)));
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const callerClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await callerClient.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);
    const uid = user.id;

    const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

    // Un admin/superadmin no se autoelimina desde la app (evita dejar el sistema sin administradores).
    const { data: prof } = await admin.from("profiles").select("role").eq("id", uid).maybeSingle();
    if (prof && ["admin", "superadmin"].includes(prof.role)) {
      return json({ error: "Las cuentas de administrador no se pueden eliminar desde la app" }, 403);
    }

    // 1) Datos del usuario (se ignoran tablas/columnas inexistentes)
    for (const [table, column] of OWNED) {
      const { error } = await admin.from(table).delete().eq(column, uid);
      if (error) console.warn(`delete-account: ${table}.${column}: ${error.message}`);
    }
    // Si era entrenador, sus alumnos quedan sin entrenador en vez de borrarse
    const { error: unlinkError } = await admin.from("profiles").update({ trainer_id: null }).eq("trainer_id", uid);
    if (unlinkError) console.warn(`delete-account: unlink alumnos: ${unlinkError.message}`);

    // 2) Archivos (fotos de progreso: carpeta "<uid>/...")
    try {
      const files = await listFiles(admin, uid);
      for (let i = 0; i < files.length; i += 100) {
        await admin.storage.from(PHOTO_BUCKET).remove(files.slice(i, i + 100));
      }
    } catch (e) {
      console.warn(`delete-account: storage: ${String(e)}`);
    }

    // 3) Cuenta de Auth (si el perfil no cae por cascade, se borra a mano)
    const { error: authError } = await admin.auth.admin.deleteUser(uid);
    if (authError) return json({ error: authError.message }, 500);
    await admin.from("profiles").delete().eq("id", uid);

    return json({ success: true });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
