import webpush from "npm:web-push@3.6.6";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
  const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";

  // Verify cron secret
  const cronSecret = req.headers.get("x-cron-secret");
  if (!cronSecret) {
    return new Response(JSON.stringify({ error: "Missing x-cron-secret header" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Fetch cron secret from internal_config
  const { data: configData, error: configError } = await supabase
    .from("internal_config")
    .select("value")
    .eq("key", "cron_secret")
    .single();

  if (configError || !configData || cronSecret !== configData.value) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return new Response(JSON.stringify({ error: "VAPID keys not configured" }), { status: 500 });
  }

  webpush.setVapidDetails(
    "mailto:admin@loop-gym.app",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );

  // Target date: today + 3 days (equivalent to CURRENT_DATE + INTERVAL '3 days')
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 3);
  const targetDateStr = targetDate.toISOString().split("T")[0];

  // Fetch students whose next_payment_date is in exactly 3 days
  // Equivalent SQL: SELECT p.id, p.name, p.email, p.next_payment_date
  //   FROM profiles p
  //   WHERE p.role = 'student'
  //     AND p.next_payment_date IS NOT NULL
  //     AND p.next_payment_date = (CURRENT_DATE + INTERVAL '3 days')::date
  const { data: students, error: studentsError } = await supabase
    .from("profiles")
    .select("id, name, email, next_payment_date")
    .eq("role", "student")
    .not("next_payment_date", "is", null)
    .eq("next_payment_date", targetDateStr);

  if (studentsError || !students) {
    return new Response(JSON.stringify({ error: "Could not fetch students", detail: studentsError?.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (students.length === 0) {
    return new Response(JSON.stringify({ sent: 0, skipped: 0, message: "No students with payment due in 3 days" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Build a set of user IDs with payment due
  const userIds = students.map((u) => u.id);

  // Fetch push subscriptions for those users
  const { data: subscriptions, error: subError } = await supabase
    .from("push_subscriptions")
    .select("user_id, subscription")
    .in("user_id", userIds);

  if (subError || !subscriptions) {
    return new Response(JSON.stringify({ error: "Could not fetch push subscriptions" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let sent = 0;
  let skipped = 0;

  for (const sub of subscriptions) {
    try {
      const payload = JSON.stringify({
        title: "💳 Recordatorio de pago",
        body: "Tu suscripción vence en 3 días. Renovála para seguir entrenando.",
        tag: "payment-reminder",
      });

      const parsed = typeof sub.subscription === "string" ? JSON.parse(sub.subscription) : sub.subscription;
      await webpush.sendNotification(parsed, payload);
      sent++;
    } catch (err) {
      console.error(`Error sending push to user ${sub.user_id}:`, err);
      skipped++;
    }
  }

  return new Response(JSON.stringify({ sent, skipped, studentsWithPaymentDue: students.length }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
