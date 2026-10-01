import { createClient } from "npm:@supabase/supabase-js@2";
import { PRICE_ARS, PLAN_DAYS, json } from "../_shared/mp.ts";

// Deploy con --no-verify-jwt: MercadoPago no envía JWT de Supabase; la
// autenticidad se valida con la firma x-signature.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

async function validSignature(req: Request, dataId: string, secret: string): Promise<boolean> {
  const sig = req.headers.get("x-signature") ?? "";
  const requestId = req.headers.get("x-request-id") ?? "";
  let ts = "", v1 = "";
  for (const part of sig.split(",")) {
    const [k, v] = part.split("=").map((s) => s.trim());
    if (k === "ts") ts = v ?? "";
    if (k === "v1") v1 = v ?? "";
  }
  if (!ts || !v1 || !dataId) return false;
  // Anti-replay: rechazar notificaciones de más de 10 min
  const tsNum = Number(ts);
  const tsMs = tsNum > 1e12 ? tsNum : tsNum * 1000;
  if (!Number.isFinite(tsMs) || Math.abs(Date.now() - tsMs) > 10 * 60 * 1000) return false;

  const id = /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
  const manifest = `id:${id};request-id:${requestId};ts:${ts};`;
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(manifest));
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return safeEqual(hex, v1.toLowerCase());
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const SECRET = Deno.env.get("MP_WEBHOOK_SECRET") ?? "";
  const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN") ?? "";
  if (!SECRET || !MP_ACCESS_TOKEN) {
    console.error("mp-webhook: faltan MP_WEBHOOK_SECRET / MP_ACCESS_TOKEN");
    return json({ error: "not_configured" }, 503);
  }

  const url = new URL(req.url);
  // deno-lint-ignore no-explicit-any
  let body: any = {};
  try { body = await req.json(); } catch { /* algunas notificaciones vienen sin body */ }

  const type = url.searchParams.get("type") ?? url.searchParams.get("topic") ?? body?.type ?? "";
  const dataId = String(url.searchParams.get("data.id") ?? body?.data?.id ?? "");

  if (!(await validSignature(req, dataId, SECRET))) return json({ error: "invalid_signature" }, 401);

  // Otros eventos (merchant_order, etc.): firmados y válidos, nada que hacer
  if (type !== "payment") return json({ ok: true, ignored: type });
  if (!/^\d+$/.test(dataId)) return json({ error: "bad_payment_id" }, 400);

  // Fuente de verdad: consultar el pago a MP, nunca confiar en el body
  // deno-lint-ignore no-explicit-any
  let payment: any;
  try {
    const r = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    });
    if (!r.ok) {
      console.error("mp-webhook: GET payment", dataId, r.status);
      return json({ error: "mp_lookup_failed" }, r.status === 404 ? 404 : 502);
    }
    payment = await r.json();
  } catch (e) {
    console.error("mp-webhook: fetch error", e);
    return json({ error: "mp_unreachable" }, 502);
  }

  // pending/rejected/etc.: se acusa recibo, MP avisará de nuevo si cambia
  if (payment.status !== "approved") return json({ ok: true, status: payment.status });

  const userId = String(payment.external_reference ?? "");
  if (!UUID_RE.test(userId)) return json({ error: "bad_external_reference" }, 422);
  if (payment.currency_id !== "ARS" || Number(payment.transaction_amount) !== PRICE_ARS) {
    console.error("mp-webhook: monto/moneda inesperados", dataId, payment.transaction_amount, payment.currency_id);
    return json({ error: "amount_mismatch" }, 422);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
  const { data, error } = await supabase.rpc("apply_mp_payment", {
    p_payment_id: Number(dataId),
    p_user_id: userId,
    p_amount: PRICE_ARS,
    p_currency: "ARS",
    p_days: PLAN_DAYS,
    p_raw: payment,
  });
  if (error) {
    console.error("mp-webhook: apply_mp_payment", error.message);
    return json({ error: "db_error" }, 500); // MP reintenta
  }
  return json({ ok: true, applied: data === true });
});
