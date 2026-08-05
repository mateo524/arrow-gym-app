import webpush from "npm:web-push@3.6.6";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  // Read env vars inside handler to avoid cold-start issues
  const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
  const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "*";

  if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails("mailto:admin@loop-gym.app", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Verify JWT from Authorization header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
  const token = authHeader.slice(7);

  // Use anon client with the user's JWT to verify identity
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user }, error: authError } = await anonClient.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const { title, body, tag, delaySeconds = 0 } = await req.json();

    // Look up subscription from DB using service role — never trust client-supplied subscription
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: subRow, error: subError } = await serviceClient
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subError || !subRow) {
      return new Response(JSON.stringify({ error: "No subscription found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const sub = typeof subRow.subscription === "string"
      ? JSON.parse(subRow.subscription)
      : subRow.subscription;

    const cappedDelay = Math.min(Math.max(0, delaySeconds), 600);

    const send = async () => {
      await webpush.sendNotification(sub, JSON.stringify({ title, body, tag }));
    };

    if (cappedDelay > 0) {
      // Para rest timers de hasta 10 minutos
      setTimeout(send, cappedDelay * 1000);
      return new Response(JSON.stringify({ scheduled: true, delaySeconds: cappedDelay }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } else {
      await send();
      return new Response(JSON.stringify({ sent: true }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  } catch (err) {
    console.error("Push error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
