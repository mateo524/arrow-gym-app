import { createClient } from "npm:@supabase/supabase-js@2";

const PRICE_ARS = 25000;
const APP_URL = "https://arrow-gym-project.vercel.app";

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN") ?? "";

  if (!MP_ACCESS_TOKEN) {
    return new Response(JSON.stringify({ error: "no_mp_token" }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  // Get authenticated user from JWT
  const authHeader = req.headers.get("Authorization") ?? "";
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let userId = "";
  let userEmail = "";
  let userName = "";

  try {
    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await supabase.auth.getUser(jwt);
    if (error || !user) throw new Error("Unauthorized");
    userId = user.id;
    userEmail = user.email ?? "";

    // Fetch profile for name
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", userId)
      .single();
    userName = profile?.name ?? userEmail;
  } catch {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  // Create MercadoPago Preference
  const preference = {
    items: [
      {
        id: "loop-gym-mensual",
        title: "Loop Gym — Suscripción mensual",
        description: "Acceso completo a Loop Gym por 30 días",
        quantity: 1,
        unit_price: PRICE_ARS,
        currency_id: "ARS",
      },
    ],
    payer: {
      email: userEmail,
      name: userName,
    },
    external_reference: userId,
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
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    const mpData = await mpRes.json();

    if (!mpRes.ok || !mpData.init_point) {
      console.error("MercadoPago error:", JSON.stringify(mpData));
      return new Response(JSON.stringify({ error: "mp_error", detail: mpData.message ?? "Unknown error" }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    return new Response(
      JSON.stringify({
        init_point: mpData.init_point,
        sandbox_init_point: mpData.sandbox_init_point,
        preference_id: mpData.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (err) {
    console.error("Fetch error:", err);
    return new Response(JSON.stringify({ error: "network_error" }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
