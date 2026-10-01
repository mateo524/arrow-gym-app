import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const MAX_QUESTION = 500;
const MAX_NAME = 80;
const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
  const json = (obj: unknown, status = 200) =>
    new Response(JSON.stringify(obj), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  // Read secrets inside handler — module-level reads cache empty on cold start
  const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!GEMINI_KEY) {
    return json({ error: "no_api_key" }, 503);
  }

  try {
    // ── AUTH: validar el JWT; la identidad sale del token, nunca del body ──
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearers+/i, "");
    if (!token) return json({ error: "unauthorized" }, 401);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return json({ error: "unauthorized" }, 401);

    let body: any;
    try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
    const mode = body?.mode === "nudge" || body?.mode === "insights" ? body.mode : "chat";

    const { data: caller } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    const callerRole = caller?.role ?? "user";
    const isStaff = ["trainer", "admin", "superadmin"].includes(callerRole);
    const isAdmin = ["admin", "superadmin"].includes(callerRole);

    // Verifica que el caller sea entrenador del alumno (o admin)
    const canActOn = async (studentId: string) => {
      if (studentId === user.id || isAdmin) return true;
      if (callerRole !== "trainer") return false;
      const { data } = await supabase.from("profiles").select("id").eq("id", studentId).eq("trainer_id", user.id).maybeSingle();
      return !!data;
    };

    // ── NUDGE MODE: generate WhatsApp message for trainer → student ──────────
    if (mode === "nudge") {
      if (!isStaff) return json({ error: "forbidden" }, 403);
      if (body.student_id && !(await canActOn(String(body.student_id)))) return json({ error: "forbidden" }, 403);
      const student_name = clip(body.student_name, MAX_NAME);
      const trainer_name = clip(body.trainer_name, MAX_NAME);
      const adherence_level = clip(body.adherence_level, 10);
      const days_since_last = Number.isFinite(Number(body.days_since_last)) ? Math.min(Math.max(0, Math.trunc(Number(body.days_since_last))), 3650) : null;

      const levelDesc = adherence_level === "red"
        ? `no entrena hace ${days_since_last ?? "varios"} días (inactivo/a)`
        : adherence_level === "yellow"
        ? `no entrena hace ${days_since_last ?? "varios"} días (en riesgo)`
        : `lleva ${days_since_last ?? "algunos"} días sin entrenar`;

      const prompt = `Sos ${trainer_name || "el coach"}, un entrenador personal que usa Loop Gym.
Escribí UN mensaje corto de WhatsApp para motivar a tu alumno/a ${student_name || "el/la alumno/a"}, quien ${levelDesc}.
El mensaje debe:
- Sonar HUMANO y en primera persona ("Te", "vos", no "tu")
- Ser cálido y motivador, no retador ni culposo
- Tener entre 2 y 3 oraciones
- NO incluir emojis excesivos (máx 1-2)
- Ser en español rioplatense
- NO mencionar la app ni términos técnicos
Devolvé SOLO el mensaje, sin comillas ni texto adicional.`;

      const geminiPayload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.85, maxOutputTokens: 150 },
      };

      const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiPayload),
      });

      if (!geminiRes.ok) {
        return json({ error: "ai_unavailable" }, 502);
      }

      const geminiData = await geminiRes.json();
      const message = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
      return json({ message });
    }

    // ── INSIGHTS / CHAT MODES: need user_id ──────────────────────────────────
    const question = clip(body.question, MAX_QUESTION);
    if (mode === "chat" && !question) return json({ error: "question required" }, 400);
    // Por defecto el propio usuario; un entrenador/admin puede pedir por un alumno suyo
    const user_id = body.user_id ? String(body.user_id) : user.id;
    if (user_id !== user.id && !(await canActOn(user_id))) return json({ error: "forbidden" }, 403);

    const sixWeeksAgo = new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [
      { data: profile },
      { data: workouts },
      { data: weightLog },
      { data: measurements },
    ] = await Promise.all([
      supabase.from("profiles").select("name, subscription_status, created_at").eq("id", user_id).single(),
      supabase.from("user_workouts").select("date, sets, duration_min, notes").eq("user_id", user_id).gte("date", sixWeeksAgo).order("date", { ascending: false }).limit(50),
      supabase.from("weight_log").select("date, kg").eq("user_id", user_id).order("date", { ascending: false }).limit(20),
      supabase.from("measurements").select("date, bicep_cm, chest_cm, waist_cm, hip_cm, quad_cm").eq("user_id", user_id).order("date", { ascending: false }).limit(5),
    ]);

    const workoutDates = (workouts ?? []).map((w: any) => w.date);
    const workoutsLast7 = workoutDates.filter((d: string) => d >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)).length;
    const workoutsLast30 = workoutDates.filter((d: string) => d >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)).length;

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

    const volumeByGroup: Record<string, number> = {};
    const recentWorkouts = (workouts ?? []).filter((w: any) => w.date >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    for (const w of recentWorkouts) {
      for (const s of (w.sets ?? [])) {
        const group = s.muscleGroup || s.muscle_group || "otro";
        volumeByGroup[group] = (volumeByGroup[group] || 0) + (Number(s.weight) * Number(s.reps) || 0);
      }
    }

    const wLog = (weightLog ?? []).slice(0, 10);
    const weightTrend = wLog.length >= 2
      ? (wLog[0].kg - wLog[wLog.length - 1].kg).toFixed(1)
      : null;

    // Stagnation: use max weight per workout session (not per set) to avoid false positives
    const stagnant: string[] = [];
    const exerciseSessions: Record<string, number[]> = {};
    for (const w of (workouts ?? []).slice(0, 20)) {
      const sessionMax: Record<string, number> = {};
      for (const s of (w.sets ?? [])) {
        const kg = Number(s.weight) || 0;
        if (kg > 0) sessionMax[s.exercise] = Math.max(sessionMax[s.exercise] ?? 0, kg);
      }
      for (const [ex, maxKg] of Object.entries(sessionMax)) {
        if (!exerciseSessions[ex]) exerciseSessions[ex] = [];
        exerciseSessions[ex].push(maxKg);
      }
    }
    for (const [ex, weights] of Object.entries(exerciseSessions)) {
      const last3 = weights.slice(0, 3);
      if (last3.length >= 3 && Math.max(...last3) === Math.min(...last3) && last3[0] > 0) stagnant.push(ex);
    }

    const lastWorkoutDate = workoutDates[0] ?? null;
    const daysSinceLast = lastWorkoutDate
      ? Math.floor((Date.now() - new Date(lastWorkoutDate).getTime()) / 86400000)
      : null;

    const userName = profile?.name ?? "el atleta";
    const memberSince = profile?.created_at ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / 86400000) : 0;

    const dataContext = `
DATOS DEL ATLETA: ${userName}
- Miembro hace: ${memberSince} dias
- Entrenamientos ultimos 7 dias: ${workoutsLast7}
- Entrenamientos ultimos 30 dias: ${workoutsLast30}
- Dias desde ultimo entreno: ${daysSinceLast ?? "desconocido"}
- Peso actual: ${wLog[0]?.kg ?? "no registrado"} kg
- Tendencia de peso (ultimas ${wLog.length} lecturas): ${weightTrend !== null ? (Number(weightTrend) > 0 ? `+${weightTrend}kg` : `${weightTrend}kg`) : "sin datos suficientes"}

RECORDS PERSONALES RECIENTES (ultimas 6 semanas):
${Object.entries(prMap).slice(0, 15).map(([ex, pr]) => `  ${ex}: ${pr.weight}kg x ${pr.reps} reps (${pr.date})`).join("\n") || "  Sin PRs registrados"}

VOLUMEN POR GRUPO MUSCULAR (ultimos 7 dias, en kg*reps):
${Object.entries(volumeByGroup).map(([g, v]) => `  ${g}: ${Math.round(v)} kg*reps`).join("\n") || "  Sin datos"}

EJERCICIOS ESTANCADOS (mismo peso 3+ sesiones):
${stagnant.slice(0, 5).join(", ") || "Ninguno detectado"}

MEDICIONES CORPORALES (ultima):
${measurements?.[0] ? `Bicep: ${measurements[0].bicep_cm}cm, Pecho: ${measurements[0].chest_cm}cm, Cintura: ${measurements[0].waist_cm}cm (${measurements[0].date})` : "Sin mediciones"}

ULTIMOS ENTRENAMIENTOS:
${(workouts ?? []).slice(0, 5).map((w: any) => `  ${w.date}: ${(w.sets ?? []).length} series, ${w.duration_min ?? "?"} min`).join("\n") || "  Sin historial"}
`.trim();

    let systemPrompt = "";
    let userMessage = question ?? "";

    if (mode === "insights") {
      systemPrompt = `Sos un coach de fitness experto. Analiza los datos del atleta y devuelve un JSON con:
{
  "summary": "resumen de 2 oraciones del estado actual",
  "alerts": ["alerta 1", "alerta 2"],
  "predictions": [{"label": "...", "value": "...", "icon": "..."}],
  "recommendation": "recomendacion principal para esta semana en 1 oracion",
  "nextSession": "sugerencia especifica para la proxima sesion"
}
Responde SOLO el JSON, sin markdown ni texto extra. Usa espanol rioplatense (vos, dale, etc.).`;
      userMessage = `Analiza los datos y genera insights accionables para esta semana.`;
    } else {
      systemPrompt = `Sos Loop Coach, un asistente de entrenamiento experto que conoce los datos reales del atleta.
Respondes en espanol rioplatense (vos, dale, etc.). Sos directo, especifico y motivador.
NUNCA inventes datos que no esten en el contexto. Si no tenes informacion suficiente, lo dices.
NO das consejos medicos ni nutricionales especificos (dosis, suplementos).
Tus respuestas son concisas (max 150 palabras) salvo que pidan algo detallado.`;
    }

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
      return json({ error: "ai_unavailable", fallback: true }, 502);
    }

    const geminiData = await geminiRes.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (mode === "insights") {
      try {
        const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleaned);
        return json({ insights: parsed, context: { workoutsLast7, workoutsLast30, daysSinceLast, stagnant } });
      } catch {
        return json({ insights: { summary: text, alerts: [], predictions: [], recommendation: "", nextSession: "" } });
      }
    }

    return json({ reply: text, context: { workoutsLast7, daysSinceLast } });

  } catch (err) {
    console.error(err);
    return json({ error: "internal_error" }, 500);
  }
});
