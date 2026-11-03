// Videos de técnica por ejercicio.
// Cubre TODOS los ejercicios (incluidos los personalizados) con una búsqueda de YouTube armada con
// el nombre. Si un ejercicio tiene un video verificado, se agrega a CURATED_VIDEO_IDS y pasa a
// abrir ese video directo (id de 11 caracteres de YouTube).

export const CURATED_VIDEO_IDS = {
  // "Press de banca plano": "XXXXXXXXXXX",
};

const ID_RE = /^[A-Za-z0-9_-]{11}$/;

/** URL para ver cómo se hace un ejercicio: video directo si está curado; si no, búsqueda en YouTube. */
export function exerciseVideoUrl(name) {
  const clean = String(name || "").trim();
  const id = CURATED_VIDEO_IDS[clean];
  if (id && ID_RE.test(id)) return `https://www.youtube.com/watch?v=${id}`;
  const q = encodeURIComponent(`cómo hacer ${clean} técnica correcta`);
  return `https://www.youtube.com/results?search_query=${q}`;
}

export function hasCuratedVideo(name) {
  return ID_RE.test(CURATED_VIDEO_IDS[String(name || "").trim()] || "");
}
