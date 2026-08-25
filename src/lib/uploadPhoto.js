import { supabase } from "./supabase.js";

/**
 * Uploads a progress photo to Supabase Storage and returns the public URL.
 * The bucket "progress-photos" must exist in your Supabase project —
 * create it via the Supabase dashboard (Storage > New bucket, set to public).
 *
 * @param {string} dataUrl - base64 data URL from FileReader
 * @param {string} userId  - authenticated user's id
 * @returns {Promise<string>} public URL of the uploaded file
 */
export async function uploadProgressPhoto(dataUrl, userId) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const ext = blob.type.includes("png") ? "png" : "jpg";
  const path = `${userId}/progress/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("progress-photos")
    .upload(path, blob, { contentType: blob.type, upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from("progress-photos").getPublicUrl(path);
  return data.publicUrl;
}
