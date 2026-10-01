import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_EMBED_URL = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent";
const GEMINI_CHAT_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const MAX_QUESTION = 500;

// Cosine similarity between two vectors
function cosineSim(a: number[], b: number[]): number {
  const dot = a.reduce((s, v, i) => s + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  return magA && magB ? dot / (magA * magB) : 0;
}

async function embed(text: string, geminiKey: string): Promise<number[]> {
  const res = await fetch(`${GEMINI_EMBED_URL}?key=${geminiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "models/text-embedding-004", content: { parts: [{ text }] } }),
  });
  const data = await res.json();
  return data.embedding?.values ?? [];
}

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

  // Read env vars inside handler (cold-start safety)
  const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  try {
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearers+/i, "");
    if (!token) return json({ error: "unauthorized" }, 401);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return json({ error: "unauthorized" }, 401);

    let body: any;
    try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
    const trainer_id = typeof body?.trainer_id === "string" ? body.trainer_id : "";
    const question = typeof body?.question === "string" ? body.question.trim().slice(0, MAX_QUESTION) : "";
    if (!trainer_id || !question) return json({ error: "trainer_id and question required" }, 400);
    if (!GEMINI_KEY) return json({ error: "no_api_key" }, 503);

    // Relación entrenador-alumno: el caller es el alumno de ese entrenador,
    // o es el propio entrenador (vista previa) sobre un alumno suyo.
    let student_id = user.id;
    if (trainer_id === user.id) {
      if (body.student_id && body.student_id !== user.id) {
        const { data: st } = await supabase.from("profiles").select("id").eq("id", String(body.student_id)).eq("trainer_id", user.id).maybeSingle();
        if (!st) return json({ error: "forbidden" }, 403);
        student_id = st.id;
      }
    } else {
      const { data: me } = await supabase.from("profiles").select("trainer_id").eq("id", user.id).maybeSingle();
      if (!me || me.trainer_id !== trainer_id) return json({ error: "forbidden" }, 403);
    }

    // Fetch trainer's recorded responses
    const { data: responses } = await supabase
      .from("testamento_responses")
      .select("id, question_hint, response_text, embedding")
      .eq("trainer_id", trainer_id)
      .limit(100);

    if (!responses || responses.length === 0) {
      return json({
        reply: "Tu entrenador aún no configuró el Modo Testamento. Contactalo directamente.",
        source: "fallback",
      });
    }

    // Embed the question
    const questionEmbedding = await embed(question, GEMINI_KEY);

    // Find most similar response
    let bestMatch = null;
    let bestScore = -1;

    for (const r of responses) {
      let embedding = r.embedding;

      // If no embedding stored, generate and save it
      if (!embedding || embedding.length === 0) {
        embedding = await embed(`${r.question_hint} ${r.response_text}`, GEMINI_KEY);
        await supabase.from("testamento_responses").update({ embedding }).eq("id", r.id);
      }

      const score = cosineSim(questionEmbedding, embedding);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = r;
      }
    }

    // If best match is too dissimilar, escalate to human
    if (bestScore < 0.55 || !bestMatch) {
      return json({
        reply: "No tengo una respuesta grabada para esto. Te recomiendo hablar directamente con tu entrenador cuando vuelva.",
        source: "no_match",
        score: bestScore,
      });
    }

    // Fetch trainer info for persona
    const { data: trainer } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", trainer_id)
      .single();

    // Fetch student context
    const sixWeeksAgo = new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data: recentWorkouts } = student_id
      ? await supabase.from("user_workouts").select("date, sets").eq("user_id", student_id).gte("date", sixWeeksAgo).order("date", { ascending: false }).limit(10)
      : { data: [] };

    const workoutCount = (recentWorkouts ?? []).length;
    const lastDate = (recentWorkouts ?? [])[0]?.date ?? "hace un tiempo";

    // Use Gemini Flash to adapt the trainer's response to the question
    const prompt = `Sos ${trainer?.name ?? "el entrenador"}, un entrenador personal.
Tenés grabada esta respuesta para preguntas similares:
"${bestMatch.response_text}"

El alumno lleva ${workoutCount} entrenamientos en las últimas 6 semanas (último: ${lastDate}).
El alumno preguntó: "${question}"

Adaptá tu respuesta grabada a esta pregunta específica. Mantené TU voz y estilo. No inventés información nueva.
Si la respuesta grabada no aplica bien, decí que no estás seguro y recomendá contactarte cuando volvés.
Respondé en máximo 100 palabras, en español rioplatense.`;

    const geminiRes = await fetch(`${GEMINI_CHAT_URL}?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 256 },
      }),
    });

    const geminiData = await geminiRes.json();
    const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? bestMatch.response_text;

    return json({
      reply,
      source: "testamento",
      similarity: bestScore,
      trainer_name: trainer?.name ?? "Tu entrenador",
    });

  } catch (err) {
    console.error(err);
    return json({ error: "internal_error" }, 500);
  }
});
