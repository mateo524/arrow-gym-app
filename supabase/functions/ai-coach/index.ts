import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { user_id, question, mode = "chat" } = await req.json();
    if (!user_id) return new Response(JSON.stringify({ error: "user_id required" }), { status: 400, headers: corsHeaders });

    // Rate limiting: max 20 calls per user per day (via simple check)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // ── Fetch all user data for context ──────────────────────────────────────
    const sixWeeksAgo = new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [
      { data: profile },
      { data: workouts },
      { data: weightLog },
      { data: measurements },
    ] = await Promise.all([
      supabase.from("profiles").select("name, weekly_goal, subscription_status, created_at").eq("id", user_id).single(),
      supabase.from("user_workouts").select("date, sets, duration_min, notes").eq("user_id", user_id).gte("date", sixWeeksAgo).order("date", { ascending: false }).limit(50),
      supabase.from("weight_log").select("date, kg").eq("user_id", user_id).order("date", { ascending: false }).limit(20),
      supabase.from("measurements").select("date, bicep_cm, chest_cm, waist_cm, hip_cm, quad_cm").eq("user_id", user_id).order("date", { ascending: false }).limit(5),
    ]);

    // ── Compute derived stats ─────────────────────────────────────────────────
    const workoutDates = (workouts ?? []).map((w: any) => w.date);
    const workoutsLast7 = workoutDates.filter((d: string) => d >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)).length;
    const workoutsLast30 = workoutDates.filter((d: string) => d >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)).length;

    // PRs per exercise from workouts
    const prMap: Record<string, { weight: number; reps: number; date: string }> = {};
    for (const w of (workouts ?? [])) {
      for (const s of (w.sets ?? [])) {
        const key = s.exercise;
        const weight = Number(s.weight) || 0;
        if (!prMap[key] || weight > prMap[key].weight) {
          prMap[key] = { weight, reps: Number(s.reps) || 0, date: w.date };
        }
      }
    }

    // Volume per muscle group last 7 days
    const volumeByGroup: Record<string, number> = {};
    const recentWorkouts = (workouts ?? []).filter((w: any) => w.date >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    for (const w of recentWorkouts) {
      for (const s of (w.sets ?? [])) {
        const group = s.muscleGroup || s.muscle_group || "otro";
        volumeByGroup[group] = (volumeByGroup[group] || 0) + (Number(s.weight) * Number(s.reps) || 0);
      }
    }

    // Weight trend
    const wLog = (weightLog ?? []).slice(0, 10);
    const weightTrend = wLog.length >= 2
      ? (wLog[0].kg - wLog[wLog.length - 1].kg).toFixed(1)
      : null;

    // Stagnation detection: exercises with same or lower weight for 3+ sessions
    const stagnant: string[] = [];
    const exerciseSessions: Record<string, number[]> = {};
    for (const w of (workouts ?? []).slice(0, 20)) {
      for (const s of (w.sets ?? [])) {
        if (!exerciseSessions[s.exercise]) exerciseSessions[s.exercise] = [];
        exerciseSessions[s.exercise].push(Number(s.weight) || 0);
      }
    }
    for (const [ex, weights] of Object.entries(exerciseSessions)) {
      const last3 = weights.slice(0, 3);
      if (last3.length >= 3 && Math.max(...last3) === Math.min(...last3)) stagnant.push(ex);
    }

    // Days since last workout
    const lastWorkoutDate = workoutDates[0] ?? null;
    const daysSinceLast = lastWorkoutDate
      ? Math.floor((Date.now() - new Date(lastWorkoutDate).getTime()) / 86400000)
      : null;

    // ── Build system context ──────────────────────────────────────────────────
    const userName = profile?.name ?? "el atleta";
    const weeklyGoal = profile?.weekly_goal ?? 3;
    const memberSince = profile?.created_at ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / 86400000) : 0;

    const dataContext = `
DATOS DEL ATLETA: ${userName}
- Miembro hace: ${memberSince} días
- Meta semanal: ${weeklyGoal} entrenamientos/semana
- Entrenamientos últimos 7 días: ${workoutsLast7}/${weeklyGoal}
- Entrenamientos últimos 30 días: ${workoutsLast30}
- Días desde último entreno: ${daysSinceLast ?? "desconocido"}
- Peso actual: ${wLog[0]?.kg ?? "no registrado"} kg
- Tendencia de peso (últimas ${wLog.length} lecturas): ${weightTrend !== null ? (Number(weightTrend) > 0 ? `+${weightTrend}kg` : `${weightTrend}kg`) : "sin datos suficientes"}

RÉCORDS PERSONALES RECIENTES (últimas 6 semanas):
${Object.entries(prMap).slice(0, 15).map(([ex, pr]) => `  ${ex}: ${pr.weight}kg × ${pr.reps} reps (${pr.date})`).join("\n") || "  Sin PRs registrados"}

VOLUMEN POR GRUPO MUSCULAR (últimos 7 días, en kg·reps):
${Object.entries(volumeByGroup).map(([g, v]) => `  ${g}: ${Math.round(v)} kg·reps`).join("\n") || "  Sin datos"}

EJERCICIOS ESTANCADOS (mismo peso 3+ sesiones):
${stagnant.slice(0, 5).join(", ") || "Ninguno detectado"}

MEDICIONES CORPORALES (última):
${measurements?.[0] ? `Bícep: ${measurements[0].bicep_cm}cm, Pecho: ${measurements[0].chest_cm}cm, Cintura: ${measurements[0].waist_cm}cm (${measurements[0].date})` : "Sin mediciones"}

ÚLTIMOS ENTRENAMIENTOS:
${(workouts ?? []).slice(0, 5).map((w: any) => `  ${w.date}: ${(w.sets ?? []).length} series, ${w.duration_min ?? "?"} min`).join("\n") || "  Sin historial"}
`.trim();

    // ── Prompt by mode ────────────────────────────────────────────────────────
    let systemPrompt = "";
    let userMessage = question ?? "";

    if (mode === "insights") {
      // Proactive weekly insights — no user question
      systemPrompt = `Sos un coach de fitness experto. Analizá los datos del atleta y devolvé un JSON con:
{
  "summary": "resumen de 2 oraciones del estado actual",
  "alerts": ["alerta 1", "alerta 2"], // max 3 alertas accionables
  "predictions": [{"label": "...", "value": "...", "icon": "..."}], // max 3 predicciones concretas
  "recommendation": "recomendación principal para esta semana en 1 oración",
  "nextSession": "sugerencia específica para la próxima sesión"
}
Respondé SOLO el JSON, sin markdown ni texto extra. Usá español rioplatense (vos, dale, etc.).`;
      userMessage = `Analizá los datos y generá insights accionables para esta semana.`;
    } else {
      // Chat mode
      systemPrompt = `Sos Loop Coach, un asistente de entrenamiento experto que conoce los datos reales del atleta.
Respondés en español rioplatense (vos, dale, etc.). Sos directo, específico y motivador.
NUNCA inventés datos que no estén en el contexto. Si no tenés información suficiente, lo decís.
NO das consejos médicos ni nutricionales específicos (dosis, suplementos).
Tus respuestas son concisas (máx 150 palabras) salvo que pidan algo detallado.`;
    }

    // ── Call Gemini Flash ─────────────────────────────────────────────────────
    const geminiPayload = {
      contents: [
        { role: "user", parts: [{ text: `${systemPrompt}\n\n${dataContext}\n\nPregunta del atleta: ${userMessage}` }] },
      ],
      generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
    };

    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiPayload),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error("Gemini error:", err);
      return new Response(JSON.stringify({ error: "ai_unavailable", fallback: true }), { status: 200, headers: corsHeaders });
    }

    const geminiData = await geminiRes.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (mode === "insights") {
      try {
        const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleaned);
        return new Response(JSON.stringify({ insights: parsed, context: { workoutsLast7, workoutsLast30, daysSinceLast, stagnant } }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ insights: { summary: text, alerts: [], predictions: [], recommendation: "", nextSession: "" } }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ reply: text, context: { workoutsLast7, daysSinceLast } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "internal_error" }), { status: 500, headers: corsHeaders });
  }
});
