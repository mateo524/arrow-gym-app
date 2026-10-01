import { createClient } from "npm:@supabase/supabase-js@2";
import { APP_URL, PRICE_ARS, PLAN_DAYS, corsHeaders, json } from "../_shared/mp.ts";

Deno.serve(async (req: Request) => {
  const cors = corsHeaders();
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, cors);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN") ?? "";

  if (!MP_ACCESS_TOKEN) return json({ error: "no_mp_token" }, 503, cors);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let userId = "";
  let userEmail = "";
  let userName = "";
  try {
    const jwt = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: { user }, error } = await supabase.auth.getUser(jwt);
    if (error || !user) throw new Error("Unauthorized");
    userId = user.id;
    userEmail = user.email ?? "";

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, subscription_status, subscription_expires_at")
      .eq("id", userId)
      .single();
    userName = profile?.name ?? userEmail;

    // Ya tiene un período vigente: no cobrar de nuevo
    if (
      profile?.subscription_status === "active" &&
      profile?.subscription_expires_at &&
      new Date(profile.subscription_expires_at).getTime() > Date.now()
    ) {
      return json({ already_active: true }, 200, cors);
    }
  } catch {
    return json({ error: "unauthorized" }, 401, cors);
  }

  const preference = {
    items: [
      {
        id: "loop-gym-mensual",
        title: "Loop Gym — Plan mensual",
        description: `Acceso completo a Loop Gym por ${PLAN_DAYS} días (pago único, sin débito automático)`,
        quantity: 1,
        unit_price: PRICE_ARS,
        currency_id: "ARS",
      },
    ],
    payer: { email: userEmail, name: userName },
    external_reference: userId,
    notification_url: `${SUPABASE_URL}/functions/v1/mp-webhook`,
    back_urls: {
      success: `${APP_URL}/#/pago-exitoso`,
      failure: `${APP_URL}/#/pago-fallido`,
      pending: `${APP_URL}/#/pago-pendiente`,
    },
    auto_return: "approved",
    statement_descriptor: "LOOP GYM",
    expires: false,
  };

  try {
    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
      body: JSON.stringify(preference),
    });
    const mpData = await mpRes.json().catch(() => ({}));

    if (!mpRes.ok || !mpData.init_point) {
      console.error("MercadoPago error:", JSON.stringify(mpData));
      return json({ error: "mp_error" }, 502, cors);
    }
    return json(
      { init_point: mpData.init_point, sandbox_init_point: mpData.sandbox_init_point, preference_id: mpData.id },
      200,
      cors,
    );
  } catch (err) {
    console.error("Fetch error:", err);
    return json({ error: "network_error" }, 502, cors);
  }
});
