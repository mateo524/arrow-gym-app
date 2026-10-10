import { describe, it, expect } from "vitest";
import { isSafeCheckoutUrl } from "./checkout.js";

describe("isSafeCheckoutUrl", () => {
  it("acepta https de MercadoPago", () => {
    expect(isSafeCheckoutUrl("https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=1")).toBe(true);
    expect(isSafeCheckoutUrl("https://mercadopago.com/x")).toBe(true);
  });
  it("rechaza otros dominios, http y basura", () => {
    expect(isSafeCheckoutUrl("http://www.mercadopago.com.ar/x")).toBe(false);
    expect(isSafeCheckoutUrl("https://mercadopago.com.evil.com/x")).toBe(false);
    expect(isSafeCheckoutUrl("https://evil.com/mercadopago.com")).toBe(false);
    expect(isSafeCheckoutUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeCheckoutUrl("")).toBe(false);
    expect(isSafeCheckoutUrl(undefined)).toBe(false);
  });
});
