import { useState } from "react";
import useAuthStore from "../store/useAuthStore.js";
import { supabase } from "../lib/supabase.js";
import { isAdvancedView } from "../config/features.js";

/**
 * Selector de vista Básica / Avanzada (como Binance Lite / Pro).
 * Básica = lo esencial. Avanzada = mediciones, análisis, RPE, volumen y nutrición detallada.
 */
export default function ViewModeToggle() {
  const profile = useAuthStore((s) => s.profile);
  const [saving, setSaving] = useState(false);
  const advanced = isAdvancedView(profile);

  async function choose(next) {
    if (saving || next === advanced) return;
    const ui_mode = next ? "advanced" : "simple";
    const prev = profile?.ui_mode;
    // Actualiza al instante; si falla el guardado, vuelve atrás
    useAuthStore.setState((s) => ({ profile: { ...s.profile, ui_mode } }));
    if (!profile?.id) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ ui_mode }).eq("id", profile.id);
    setSaving(false);
    if (error) {
      useAuthStore.setState((s) => ({ profile: { ...s.profile, ui_mode: prev } }));
      window.__showToast?.("No se pudo cambiar la vista. Probá de nuevo.", "error");
    } else {
      window.__showToast?.(next ? "Vista avanzada: más datos y análisis" : "Vista básica: solo lo esencial", "success");
    }
  }

  const seg = (active) => ({
    flex: 1, padding: "8px 10px", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", borderRadius: 10,
    background: active ? "var(--green)" : "transparent",
    color: active ? "#fff" : "var(--muted)",
  });

  return (
    <div role="group" aria-label="Vista de la app" data-testid="view-toggle"
      style={{ display: "flex", gap: 4, background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 12, padding: 3, marginBottom: 14 }}>
      <button type="button" aria-pressed={!advanced} style={seg(!advanced)} onClick={() => choose(false)}>Básica</button>
      <button type="button" aria-pressed={advanced} style={seg(advanced)} onClick={() => choose(true)}>Avanzada</button>
    </div>
  );
}
