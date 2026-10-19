import webpush from "npm:web-push@3.6.6";
import { createClient } from "npm:@supabase/supabase-js@2";

// Comparación en tiempo constante (SHA-256 evita filtrar el largo)
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(a)),
    crypto.subtle.digest("SHA-256", enc.encode(String(b ?? ""))),
  ]);
  const x = new Uint8Array(ha), y = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

// Fecha/hora de Argentina (UTC-3, sin horario de verano). El servidor corre en UTC.
const AR_OFFSET_MS = -3 * 3600 * 1000;
function argentinaNow() {
  const d = new Date(Date.now() + AR_OFFSET_MS);
  return { hour: d.getUTCHours(), ms: d.getTime() };
}
const dayKey = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const inSendWindow = (hour: number) => (hour >= 8 && hour < 11) || (hour >= 19 && hour < 22);
const fmt = (n: number) => Math.round(n).toLocaleString("es-AR");

type WorkoutRow = { date: string; sets: { exercise?: string; weight?: string | number; reps?: string | number }[] | null };

function summarize(rows: WorkoutRow[]) {
  let sets = 0;
  let volume = 0;
  const counts: Record<string, number> = {};
  for (const w of rows) {
    for (const s of Array.isArray(w.sets) ? w.sets : []) {
      const kg = Number(s.weight) || 0;
      const reps = Number(s.reps) || 0;
      if (kg > 0 && reps > 0) { sets++; volume += kg * reps; }
      else if (reps > 0) sets++;
      if (s.exercise) counts[s.exercise] = (counts[s.exercise] ?? 0) + 1;
    }
  }
  let top: string | null = null;
  let topCount = 0;
  for (const [ex, c] of Object.entries(counts)) if (c > topCount) { top = ex; topCount = c; }
  return { sessions: rows.length, sets, volume, top };
}

Deno.serve(async (req: Request) => {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
  const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

  const cronSecret = req.headers.get("x-cron-secret");
  if (!cronSecret) return json({ error: "Missing x-cron-secret header" }, 401);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: configData, error: configError } = await supabase
    .from("internal_config").select("value").eq("key", "cron_secret").single();
  if (configError || !configData || !(await timingSafeEqual(cronSecret, configData.value))) {
    return json({ error: "Unauthorized" }, 403);
  }
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return json({ error: "VAPID keys not configured" }, 500);

  const ar = argentinaNow();
  if (!inSendWindow(ar.hour)) return json({ sent: 0, reason: `fuera de horario (${ar.hour}h Argentina)` });

  webpush.setVapidDetails("mailto:admin@loop-gym.app", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const { data: subscriptions, error: subError } = await supabase
    .from("push_subscriptions").select("user_id, subscription");
  if (subError || !subscriptions) return json({ error: "Could not fetch push subscriptions" }, 500);

  // Esta semana = últimos 7 días (incluye hoy); la anterior = los 7 días previos. Fechas de Argentina.
  const weekStart = dayKey(ar.ms - 6 * 86400000);
  const prevStart = dayKey(ar.ms - 13 * 86400000);

  let sent = 0;
  let skipped = 0;

  for (const sub of subscriptions) {
    try {
      const { user_id, subscription } = sub;

      // No molestar si está entrenando justo ahora
      const { data: prof } = await supabase
        .from("profiles").select("workout_active_until").eq("id", user_id).maybeSingle();
      if (prof?.workout_active_until && new Date(prof.workout_active_until).getTime() > Date.now()) {
        skipped++;
        continue;
      }

      const { data: rows, error: workoutError } = await supabase
        .from("user_workouts")
        .select("date, sets")
        .eq("user_id", user_id)
        .is("deleted_at", null)
        .gte("date", prevStart)
        .order("date", { ascending: false });

      // Si la columna deleted_at todavía no existe en esta base, se reintenta sin ese filtro
      let all = rows as WorkoutRow[] | null;
      if (workoutError) {
        const retry = await supabase
          .from("user_workouts").select("date, sets").eq("user_id", user_id)
          .gte("date", prevStart).order("date", { ascending: false });
        all = retry.error ? null : (retry.data as WorkoutRow[]);
      }
      if (!all) { skipped++; continue; }

      const thisWeek = summarize(all.filter((w) => w.date >= weekStart));
      const prevWeek = summarize(all.filter((w) => w.date < weekStart));

      // Quien no entrenó esta semana lo cubre el aviso de "volvé a entrenar"
      if (thisWeek.sessions === 0) { skipped++; continue; }

      const diff = thisWeek.sessions - prevWeek.sessions;
      const compare = prevWeek.sessions === 0
        ? ""
        : diff > 0 ? ` (${diff} más que la semana pasada)`
        : diff < 0 ? ` (${-diff} menos que la semana pasada)`
        : " (igual que la semana pasada)";

      const parts = [
        `${thisWeek.sessions} ${thisWeek.sessions === 1 ? "entrenamiento" : "entrenamientos"}${compare}`,
      ];
      if (thisWeek.sets > 0) parts.push(`${thisWeek.sets} series`);
      if (thisWeek.volume > 0) parts.push(`${fmt(thisWeek.volume)} kg de volumen`);
      const body = parts.join(" · ") + (thisWeek.top ? `. Ejercicio estrella: ${thisWeek.top}.` : ".");

      const payload = JSON.stringify({ title: "Tu semana en Loop Gym", body, tag: "weekly-summary", url: "/" });
      const parsed = typeof subscription === "string" ? JSON.parse(subscription) : subscription;
      await webpush.sendNotification(parsed, payload);
      sent++;
    } catch (err) {
      console.error(`Error sending weekly summary push to user ${sub.user_id}:`, err);
      skipped++;
    }
  }

  return json({ sent, skipped });
});
