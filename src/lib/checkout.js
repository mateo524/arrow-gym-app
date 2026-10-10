// Abre el checkout de MercadoPago solo si el link es https y del dominio de MercadoPago.
const MP_HOST = /(^|\.)mercadopago\.com(\.[a-z]{2})?$/;

export function isSafeCheckoutUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && MP_HOST.test(u.hostname);
  } catch {
    return false;
  }
}

export function openCheckout(url) {
  if (!isSafeCheckoutUrl(url)) {
    window.__showToast?.("No se pudo abrir el pago. Intentá de nuevo.", "error");
    return false;
  }
  window.location.assign(new URL(url).href);
  return true;
}
