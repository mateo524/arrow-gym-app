import { useState, useMemo } from "react";
import useAuthStore from "../store/useAuthStore.js";
import { supabase } from "../lib/supabase.js";
import Icon from "./Icon.jsx";
import {
  SKINFOLD_FIELDS, GIRTH_FIELDS, BREADTH_FIELDS, computeAnthropometry, missingForAnthropometry,
} from "../lib/anthropometry.js";

const LABEL = { fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em" };
const n1 = (v, d = 1) => Number(v).toFixed(d).replace(".", ",");

function Progress({ label, done, total, goTab, tab }) {
  const ok = done === total;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
      <span aria-hidden="true" style={{ color: ok ? "var(--green)" : "var(--muted)", display: "inline-flex" }}>
        <Icon name={ok ? "CheckCircle" : "AlertCircle"} size={16} />
      </span>
      <span style={{ flex: 1, fontSize: 13 }}>{label}</span>
      <b style={{ fontSize: 13, color: ok ? "var(--green)" : "var(--text)" }}>{done}/{total}</b>
      {!ok && goTab && (
        <button type="button" className="ghost" style={{ padding: "4px 10px", fontSize: 12, minHeight: 0 }} onClick={() => goTab(tab)}>Cargar</button>
      )}
    </div>
  );
}

// Somatocarta: X (ecto - endo) de -8 a 8, Y de -8 a 16. El triángulo marca los extremos 7-1-1.
function Somatochart({ x, y }) {
  const W = 220, H = 300, sx = W / 16, sy = H / 24;
  const px = (v) => ((Math.min(8, Math.max(-8, v)) + 8) * sx);
  const py = (v) => H - ((Math.min(16, Math.max(-8, v)) + 8) * sy);
  return (
    <svg viewBox={`-6 -14 ${W + 12} ${H + 40}`} style={{ width: "100%", maxWidth: 260, display: "block", margin: "0 auto" }} role="img"
      aria-label={`Somatocarta: punto en X ${n1(x)} e Y ${n1(y)}`}>
      <rect x="0" y="0" width={W} height={H} fill="none" stroke="var(--line)" />
      {Array.from({ length: 9 }, (_, i) => <line key={"v" + i} x1={i * 2 * sx} y1="0" x2={i * 2 * sx} y2={H} stroke="var(--line)" strokeWidth="0.5" />)}
      {Array.from({ length: 13 }, (_, i) => <line key={"h" + i} x1="0" y1={i * 2 * sy} x2={W} y2={i * 2 * sy} stroke="var(--line)" strokeWidth="0.5" />)}
      <polygon points={`${px(-6)},${py(-6)} ${px(0)},${py(12)} ${px(6)},${py(-6)}`} fill="rgba(124,58,237,.14)" stroke="#7c3aed" strokeWidth="1.5" />
      <line x1={px(0)} y1="0" x2={px(0)} y2={H} stroke="var(--muted)" strokeWidth="0.8" />
      <line x1="0" y1={py(0)} x2={W} y2={py(0)} stroke="var(--muted)" strokeWidth="0.8" />
      <text x={px(0)} y={py(12) - 5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#7c3aed">MESOMORFO</text>
      <text x={px(-6)} y={py(-6) + 14} textAnchor="middle" fontSize="10" fontWeight="700" fill="#7c3aed">ENDOMORFO</text>
      <text x={px(6)} y={py(-6) + 14} textAnchor="middle" fontSize="10" fontWeight="700" fill="#7c3aed">ECTOMORFO</text>
      <circle cx={px(x)} cy={py(y)} r="6" fill="#ef4444" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}

export default function AnthropometryTab({ profile, weightKg, onGoTab }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sexSaving, setSexSaving] = useState(false);

  const have = (k) => Number(profile?.[k]) > 0;
  const skin = SKINFOLD_FIELDS.filter((f) => have(f.key)).length;
  const girth = GIRTH_FIELDS.filter((f) => have(f.key)).length;
  const breadth = BREADTH_FIELDS.filter((f) => have(f.key)).length;
  const status = useMemo(() => missingForAnthropometry(profile, weightKg), [profile, weightKg]);
  const report = useMemo(() => (status.complete ? computeAnthropometry(profile, weightKg) : null), [status.complete, profile, weightKg]);
  const basicsMissing = status.missing.filter((m) => ["Peso", "Talla", "Sexo", "Fecha de nacimiento"].includes(m));

  async function saveSex(sex) {
    if (!profile?.id) return;
    setSexSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({ sex }).eq("id", profile.id);
      if (error) throw error;
      const updated = { ...(useAuthStore.getState().profile || { id: profile.id }), sex };
      useAuthStore.setState({ profile: updated });
      try { useAuthStore.getState().cacheProfile(updated); } catch { /* storage lleno: el servidor ya lo tiene */ }
    } catch {
      window.__showToast?.("No se pudo guardar el sexo. Probá de nuevo.", "error");
    }
    setSexSaving(false);
  }

  async function downloadPdf() {
    if (!report || busy) return;
    setBusy(true); setErr("");
    try {
      const { buildAnthropometryPdf } = await import("../lib/anthropometryPdf.js");
      const { blob, filename } = await buildAnthropometryPdf(report);
      const file = new File([blob], filename, { type: "application/pdf" });
      // En el celular se abre el menú de compartir/guardar; en la compu se descarga directo
      if (navigator.canShare?.({ files: [file] }) && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
        try { await navigator.share({ files: [file], title: "Informe antropométrico" }); setBusy(false); return; }
        catch (e) { if (e?.name === "AbortError") { setBusy(false); return; } }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch {
      setErr("No se pudo generar el PDF. Probá de nuevo.");
    }
    setBusy(false);
  }

  return (
    <div>
      <p style={{ ...LABEL, margin: "0 0 4px" }}>Informe de antropometría</p>
      <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 10px", lineHeight: 1.5 }}>
        Con los 8 pliegues, los perímetros y los diámetros cargados se arma el informe completo: composición corporal, suma de 6 y de 8 pliegues, somatotipo y PDF para descargar.
      </p>

      <Progress label="Pliegues cutáneos" done={skin} total={8} goTab={onGoTab} tab="pliegues" />
      <Progress label="Perímetros" done={girth} total={GIRTH_FIELDS.length} goTab={onGoTab} tab="perimetros" />
      <Progress label="Diámetros óseos" done={breadth} total={2} goTab={onGoTab} tab="perimetros" />
      <Progress label="Datos básicos (peso, talla, edad, sexo)" done={4 - basicsMissing.length} total={4} goTab={onGoTab} tab="basico" />

      {basicsMissing.includes("Sexo") && (
        <div style={{ margin: "12px 0 0" }}>
          <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 6px" }}>El sexo biológico se usa en las fórmulas de grasa corporal.</p>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ id: "M", label: "Masculino" }, { id: "F", label: "Femenino" }].map((o) => (
              <button key={o.id} type="button" className="ghost" disabled={sexSaving} style={{ flex: 1 }} onClick={() => saveSex(o.id)}>{o.label}</button>
            ))}
          </div>
        </div>
      )}

      {!report && (
        <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "14px 0 0", lineHeight: 1.5 }}>
          Faltan: {status.missing.join(", ")}.
        </p>
      )}

      {report && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              ["IMC", n1(report.bmi), report.bmiCategory],
              ["% grasa (Durnin-W.)", `${n1(report.fatDW)} %`, report.fatDWCategory],
              ["% grasa (Faulkner)", `${n1(report.fatFaulkner)} %`, "4 pliegues"],
              ["Masa grasa", `${n1(report.fatMassKg)} kg`, `Magra: ${n1(report.leanMassKg)} kg`],
              ["% grasa (Yuhasz)", `${n1(report.fatYuhasz)} %`, report.fatYuhaszCategory],
              ["Masa muscular (Lee)", `${n1(report.muscle.kg)} kg`, `${n1(report.muscle.pct)} % del peso`],
              ["Suma de 6 pliegues", `${n1(report.sum6)} mm`, "perfil restringido"],
              ["Suma de 8 pliegues", `${n1(report.sum8)} mm`, "los 8 pliegues"],
            ].map(([l, v, sub]) => (
              <div key={l} style={{ background: "var(--panel2, var(--panel))", border: "1px solid var(--line)", borderRadius: 12, padding: "10px 12px" }}>
                <div style={{ ...LABEL, fontSize: 10 }}>{l}</div>
                <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2, marginTop: 2 }}>{v}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{sub}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, textAlign: "center" }}>
            <div style={{ ...LABEL, marginBottom: 2 }}>Somatotipo</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "var(--green)" }}>
              {n1(report.somatotype.endo)} – {n1(report.somatotype.meso)} – {n1(report.somatotype.ecto)}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 8 }}>{report.somatotypeLabel}</div>
            <Somatochart x={report.somatotype.x} y={report.somatotype.y} />
          </div>

          {report.warnings.length > 0 && (
            <div role="alert" style={{ marginTop: 12, fontSize: 12, color: "#b45309", background: "rgba(245,158,11,.12)", borderRadius: 10, padding: "8px 10px" }}>
              {report.warnings.map((w) => <div key={w}>{w}</div>)}
            </div>
          )}

          <button type="button" className="primary" style={{ width: "100%", marginTop: 14 }} onClick={downloadPdf} disabled={busy}>
            <Icon name="Download" size={15} style={{ display: "inline-block", verticalAlign: "middle", marginRight: 6 }} />
            {busy ? "Generando PDF…" : "Descargar informe en PDF"}
          </button>
          {err && <div role="alert" className="login-error" style={{ marginTop: 8 }}><span>{err}</span></div>}
          <p style={{ fontSize: 11, color: "var(--muted)", margin: "10px 0 0", lineHeight: 1.5 }}>
            Valores orientativos. El % de grasa es una estimación indirecta; sirve para comparar tus mediciones en el tiempo.
          </p>
        </div>
      )}
    </div>
  );
}
