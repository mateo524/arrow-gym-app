// Utilidades compartidas de MercadoPago (precio y CORS en un solo lugar).

export const APP_URL = Deno.env.get("APP_URL") ?? "https://arrow-gym-project.vercel.app";
export const PLAN_DAYS = 30;

// Precio único del plan mensual (ARS). Configurable con el secret PRICE_ARS.
export const PRICE_ARS = (() => {
  const n = Number(Deno.env.get("PRICE_ARS") ?? "10000");
  return Number.isFinite(n) && n > 0 ? n : 10000;
})();

export function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? APP_URL,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

export function json(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extra },
  });
}
