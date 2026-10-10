import { supabase } from "./supabase.js";

// Fotos de progreso: el bucket es privado, así que se muestran con una URL firmada que vence.
// Soporta fotos nuevas ("storage:progress-photos/<ruta>") y las viejas guardadas con la URL pública.
const BUCKET = "progress-photos";
const TTL_SECONDS = 3600;
const cache = new Map(); // ruta -> { url, exp }

export function photoPathFromUrl(url) {
  if (!url || typeof url !== "string") return null;
  if (url.startsWith("storage:")) return url.slice("storage:".length).replace(new RegExp(`^${BUCKET}/`), "");
  const m = url.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/progress-photos\/([^?]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

/** Valor que se guarda en la foto al subirla (no es una URL que se pueda abrir directo). */
export function storedPhotoRef(path) {
  return `storage:${BUCKET}/${path}`;
}

/** Lo que se puede mostrar ya mismo, sin red ("" si todavía hay que firmar). */
export function cachedPhotoSrc(photo) {
  if (photo?.dataUrl) return photo.dataUrl;
  const path = photoPathFromUrl(photo?.url);
  if (!path) return photo?.url || "";
  const hit = cache.get(path);
  return hit && hit.exp > Date.now() ? hit.url : "";
}

export async function resolvePhotoSrc(photo) {
  if (photo?.dataUrl) return photo.dataUrl;
  const path = photoPathFromUrl(photo?.url);
  if (!path) return photo?.url || "";
  const hit = cache.get(path);
  if (hit && hit.exp > Date.now()) return hit.url;
  try {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, TTL_SECONDS);
    if (error || !data?.signedUrl) throw error || new Error("sin url");
    cache.set(path, { url: data.signedUrl, exp: Date.now() + (TTL_SECONDS - 60) * 1000 });
    return data.signedUrl;
  } catch {
    // Sin firma (offline o bucket todavía público): se intenta la URL vieja
    return /^https?:/.test(photo?.url || "") ? photo.url : "";
  }
}
