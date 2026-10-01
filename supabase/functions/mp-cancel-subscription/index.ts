import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/mp.ts";

// No hay débito automático: "cancelar" = marcar que no se renueva.
// El acceso sigue hasta subscription_expires_at.
Deno.serve(async (req: Request) => {
  const cors = corsHeaders();
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, cors);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const jwt = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  const { data: { user }, error: authErr } = await supabase.auth.getUser(jwt);
  if (authErr || !user) return json({ error: "unauthorized" }, 401, cors);

  const { data: profile, error: readErr } = await supabase
    .from("profiles")
    .select("subscription_status, subscription_expires_at")
    .eq("id", user.id)
    .single();
  if (readErr || !profile) return json({ error: "profile_not_found" }, 404, cors);
  if (profile.subscription_status !== "active") return json({ error: "not_active" }, 409, cors);

  const { error } = await supabase
    .from("profiles")
    .update({ subscription_cancel_at_period_end: true })
    .eq("id", user.id);
  if (error) {
    console.error("cancel update error:", error.message);
    return json({ error: "db_error" }, 500, cors);
  }
  return json({ ok: true, expires_at: profile.subscription_expires_at }, 200, cors);
});
