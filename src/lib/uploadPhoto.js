import { supabase } from "./supabase.js";
import { storedPhotoRef } from "./photoUrl.js";

/**
 * Uploads a progress photo to Supabase Storage and returns a stored reference (storage:progress-photos/<path>).
 * The bucket "progress-photos" must exist in your Supabase project —
 * create it via the Supabase dashboard (Storage > New bucket, set to PRIVATE (see supabase/APLICAR_AHORA_3.sql)).
 *
 * @param {string} dataUrl - base64 data URL from FileReader
 * @param {string} userId  - authenticated user's id
 * @returns {Promise<string>} reference of the uploaded file
 */
function dataUrlToBlob(dataUrl) {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const bytes = atob(data);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

export async function uploadProgressPhoto(dataUrl, userId) {
  const blob = dataUrlToBlob(dataUrl);
  const ext = blob.type.includes("png") ? "png" : "jpg";
  const path = `${userId}/progress/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("progress-photos")
    .upload(path, blob, { contentType: blob.type, upsert: false });

  if (error) throw error;

  // El bucket es privado: se guarda una referencia y se muestra con URL firmada (ver PhotoImg)
  return storedPhotoRef(path);
}
