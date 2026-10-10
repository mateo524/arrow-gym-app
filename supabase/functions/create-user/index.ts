// create-user: un admin o entrenador crea una cuenta (sin mail de confirmación, activa al instante).
//
// Versión endurecida del código que corría en producción (que no estaba en el repo). Cambios:
//  - El ROL que se puede crear depende de quién llama (antes cualquiera podía crear un superadmin):
//      trainer    -> solo 'user' (y queda asignado a sí mismo)
//      admin      -> 'user' y 'trainer'
//      superadmin -> cualquiera
//  - trainer_id (cuando lo manda un admin) debe ser un entrenador existente.
//  - Validación de email, contraseña, nombre y números; errores siempre en JSON.
//  - La cuenta se crea con el rol real en app_metadata (handle_new_user ya no lee el rol de user_metadata).
//
// DESPLIEGUE (manual): Supabase Dashboard > Edge Functions > create-user > pegar este código > Deploy.
// Mantener "Verify JWT" activado.
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: corsHeaders });

const CAN_CREATE: Record<string, string[]> = {
  trainer: ["user"],
  admin: ["user", "trainer"],
  superadmin: ["user", "trainer", "admin", "superadmin"],
};

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

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
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) return json({ error: "Unauthorized" }, 401);

    const { data: callerProfile } = await callerClient.from("profiles").select("role").eq("id", caller.id).single();
    const allowedRoles = callerProfile ? CAN_CREATE[callerProfile.role] : undefined;
    if (!allowedRoles) return json({ error: "Forbidden: solo admins y entrenadores pueden crear usuarios" }, 403);

    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const name = String(body.name ?? "").trim();
    const role = String(body.role ?? "user");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "El email no es válido" }, 400);
    if (password.length < 8) return json({ error: "La contraseña debe tener al menos 8 caracteres" }, 400);
    if (name.length < 2 || name.length > 80) return json({ error: "El nombre debe tener entre 2 y 80 caracteres" }, 400);
    if (!allowedRoles.includes(role)) return json({ error: `No tenés permiso para crear cuentas con rol "${role}"` }, 403);

    const adminClient = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

    // Un entrenador solo crea alumnos propios; un admin puede indicar el entrenador (que debe existir).
    let trainerId: string | null = null;
    if (role === "user") {
      if (callerProfile!.role === "trainer") {
        trainerId = caller.id;
      } else if (body.trainer_id) {
        const { data: t } = await adminClient.from("profiles").select("id, role").eq("id", String(body.trainer_id)).single();
        if (!t || t.role !== "trainer") return json({ error: "El entrenador indicado no existe" }, 400);
        trainerId = t.id;
      }
    }

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
      app_metadata: { role }, // el rol NUNCA va en user_metadata (lo controla el cliente)
    });
    if (createError) return json({ error: createError.message }, 400);

    const userId = newUser.user.id;
    const isStudent = role === "user";
    const { error: profileError } = await adminClient.from("profiles").upsert({
      id: userId,
      name,
      email,
      role,
      trainer_id: trainerId,
      weight_kg: isStudent ? num(body.weight_kg) : null,
      height_cm: isStudent ? num(body.height_cm) : null,
      age: isStudent ? num(body.age) : null,
      shoulder_alert: isStudent ? !!body.shoulder_alert : false,
    });
    if (profileError) {
      await adminClient.auth.admin.deleteUser(userId); // rollback
      return json({ error: profileError.message }, 400);
    }

    return json({ success: true, userId });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
