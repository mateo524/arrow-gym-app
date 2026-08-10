import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";

export default function TrainerLandingPage({ inviteCode, onJoin, onBack }) {
  const [trainer, setTrainer] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [studentCount, setStudentCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!inviteCode) { setError("Link inválido."); setLoading(false); return; }
    (async () => {
      // Resolve invite code → trainer_id
      const { data: codeRow } = await supabase
        .from("invite_codes")
        .select("trainer_id")
        .eq("code", inviteCode)
        .maybeSingle();

      if (!codeRow?.trainer_id) {
        setError("Este link no es válido o expiró.");
        setLoading(false);
        return;
      }

      const tid = codeRow.trainer_id;

      // Fetch trainer profile + student count in parallel
      const [profileRes, countRes, routinesRes] = await Promise.all([
        supabase.from("profiles").select("id, name, email").eq("id", tid).maybeSingle(),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("trainer_id", tid),
        supabase.from("routines").select("id, name, exercises").eq("user_id", tid).eq("is_template", true).limit(6),
      ]);

      setTrainer(profileRes.data);
      setStudentCount(countRes.count ?? 0);
      setRoutines(routinesRes.data || []);
      setLoading(false);
    })();
  }, [inviteCode]);

  const trainerName = trainer?.name || trainer?.email?.split("@")[0] || "tu entrenador";
  const initial = trainerName[0]?.toUpperCase() || "T";

  if (loading) {
    return (
      <div style={{ minHeight: "100dvh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--muted)", fontSize: 14 }}>Cargando perfil…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100dvh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>😕</div>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>{error}</p>
        <button className="ghost" style={{ marginTop: 16 }} onClick={onBack}>Volver al inicio</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg, rgba(168,85,247,.18) 0%, rgba(52,211,153,.1) 100%)", padding: "48px 24px 32px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        {/* Avatar */}
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #a855f7, #34d399)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#fff", margin: "0 auto 16px", boxShadow: "0 4px 24px rgba(168,85,247,.35)" }}>
          {initial}
        </div>

        <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Entrenador personal
        </p>
        <h1 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 900 }}>{trainerName}</h1>

        {studentCount !== null && (
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
            {studentCount} {studentCount === 1 ? "alumno" : "alumnos"} activos
          </p>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "24px 20px", maxWidth: 480, margin: "0 auto", width: "100%" }}>

        {/* Value props */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {[
            { icon: "💪", text: "Rutinas personalizadas según tus objetivos" },
            { icon: "📊", text: "Seguimiento de progreso y cargas en tiempo real" },
            { icon: "🤖", text: "Coach con IA que sugiere pesos y descansos" },
            { icon: "🔔", text: "Recordatorios y empuje para mantener la racha" },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--panel)", borderRadius: 12, padding: "10px 14px" }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
              <span style={{ fontSize: 13, color: "var(--text)" }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Programs preview */}
        {routines.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 10px" }}>
              Programas disponibles
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {routines.slice(0, 4).map(r => (
                <div key={r.id} style={{ background: "var(--panel)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 14, color: "var(--green)" }}>📋</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>
                      {(r.exercises || []).length} ejercicio{(r.exercises || []).length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              ))}
              {routines.length > 4 && (
                <p style={{ fontSize: 12, color: "var(--muted)", margin: "4px 0 0", textAlign: "center" }}>
                  +{routines.length - 4} programa{routines.length - 4 !== 1 ? "s" : ""} más
                </p>
              )}
            </div>
          </div>
        )}

        {/* Pricing */}
        <div style={{ background: "rgba(168,85,247,.08)", border: "1px solid rgba(168,85,247,.25)", borderRadius: 14, padding: "14px 16px", marginBottom: 24, textAlign: "center" }}>
          <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--muted)" }}>30 días de prueba gratis, después</p>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "var(--text)" }}>
            $10.000 <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>ARS / mes</span>
          </p>
        </div>

        {/* CTA */}
        <button
          className="primary"
          style={{ width: "100%", padding: "16px", fontSize: 16, fontWeight: 800, borderRadius: 14, marginBottom: 12 }}
          onClick={onJoin}
        >
          Unirme con {trainerName.split(" ")[0]}
        </button>
        <button className="ghost" style={{ width: "100%", fontSize: 13, color: "var(--muted)" }} onClick={onBack}>
          Volver al inicio
        </button>

        <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", margin: "16px 0 0", lineHeight: 1.5 }}>
          Al unirte aceptás los términos de uso. Cancelá cuando quieras.
        </p>
      </div>
    </div>
  );
}
