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

  // Fetch all users with active push subscriptions
  const { data: subscriptions, error: subError } = await supabase
    .from("push_subscriptions")
    .select("user_id, subscription");

  if (subError || !subscriptions) {
    return new Response(JSON.stringify({ error: "Could not fetch push subscriptions" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Calculate the date 7 days ago in YYYY-MM-DD format
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

  let sent = 0;
  let skipped = 0;

  for (const sub of subscriptions) {
    try {
      const { user_id, subscription } = sub;

      // Fetch workouts from the last 7 days
      const { data: workouts, error: workoutError } = await supabase
        .from("user_workouts")
        .select("date, sets")
        .eq("user_id", user_id)
        .gte("date", sevenDaysAgoStr)
        .order("date", { ascending: false });

      if (workoutError || !workouts || workouts.length === 0) {
        // Skip users who didn't train at all this week (daily-reengagement covers them)
        skipped++;
        continue;
      }

      const sessionsThisWeek = workouts.length;

      // Find the most frequent exercise across all workouts this week
      const exerciseCounts: Record<string, number> = {};
      let bestPR = 0;

      for (const workout of workouts) {
        if (Array.isArray(workout.sets)) {
          for (const set of workout.sets) {
            if (set.exercise) {
              exerciseCounts[set.exercise] = (exerciseCounts[set.exercise] ?? 0) + 1;
            }
            if (typeof set.weight === "number" && set.weight > bestPR) {
              bestPR = set.weight;
            }
          }
        }
      }

      let topExercise: string | null = null;
      let topCount = 0;
      for (const [exercise, count] of Object.entries(exerciseCounts)) {
        if (count > topCount) {
          topCount = count;
          topExercise = exercise;
        }
      }

      const title = "📊 Tu semana en Loop Gym";
      const body = topExercise
        ? `${sessionsThisWeek} entrenamientos · Tu ejercicio estrella: ${topExercise}`
        : `${sessionsThisWeek} entrenamientos esta semana. ¡Buen trabajo!`;

      const payload = JSON.stringify({
        title,
        body,
        tag: "weekly-summary",
      });

      const parsed = typeof subscription === "string" ? JSON.parse(subscription) : subscription;
      await webpush.sendNotification(parsed, payload);
      sent++;
    } catch (err) {
      console.error(`Error sending weekly summary push to user ${sub.user_id}:`, err);
      skipped++;
    }
  }

  return new Response(JSON.stringify({ sent, skipped }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
