import { useEffect, useState } from "react";
import { resolvePhotoSrc, cachedPhotoSrc } from "../lib/photoUrl.js";

// <img> de una foto de progreso: resuelve la URL firmada si hace falta.
export default function PhotoImg({ photo, alt = "", ...imgProps }) {
  const [src, setSrc] = useState(() => cachedPhotoSrc(photo));

  useEffect(() => {
    let alive = true;
    resolvePhotoSrc(photo).then((s) => { if (alive) setSrc(s); });
    return () => { alive = false; };
  }, [photo?.dataUrl, photo?.url]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!src) {
    return <div role="img" aria-label={alt || "Cargando foto"} style={{ ...imgProps.style, background: "var(--panel2)", minHeight: 120 }} />;
  }
  return <img alt={alt} {...imgProps} src={src} />;
}
