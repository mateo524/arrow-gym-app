import { useState, useEffect, useCallback } from "react";
import useAuthStore from "../store/useAuthStore.js";
import useStore from "../store/useStore.js";
import { supabase } from "../lib/supabase.js";
import Icon from "../components/Icon.jsx";

export default function ReferralPage() {
  const { profile } = useAuthStore();
  const setPage = useStore(s => s.setPage);
  const [inviteCode, setInviteCode] = useState(null);
  const [payingStudents, setPayingStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const PAYING_GOAL = 5; // alumnos pagando para ganar 1 mes gratis

  const loadData = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);

    // Traer código de invitación existente
    const { data: codeData } = await supabase
      .from("invite_codes")
      .select("code")
      .eq("trainer_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (codeData?.code) setInviteCode(codeData.code);

    // Traer todos los alumnos vinculados
    const [{ data: students }, { data: convData }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, name, email, created_at, subscription_status")
        .eq("trainer_id", profile.id),
      supabase
        .from("referral_conversions")
        .select("id, converted_user_id, created_at, profiles:converted_user_id(name, email)")
        .eq("trainer_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const all = students || [];
    setTotalStudents(all.length);
    setPayingStudents(all.filter(s => s.subscription_status === "active"));
    setConversions(convData || []);
    setLoading(false);
  }, [profile?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  async function generateCode() {
    if (!profile?.id) return;
    setGenerating(true);
    const code = Math.random().toString(36).slice(2, 10).toUpperCase();
    const { error } = await supabase
      .from("invite_codes")
      .insert({ trainer_id: profile.id, code });
    if (!error) setInviteCode(code);
    setGenerating(false);
  }

  async function copyLink() {
    const link = `${window.location.origin}/#/join/${inviteCode}`;
    try { await navigator.clipboard.writeText(link); } catch { }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const paying = payingStudents.length;
  const progress = Math.min(paying, PAYING_GOAL);
  const rewardReached = paying >= PAYING_GOAL;
  const monthsEarned = Math.floor(paying / PAYING_GOAL);

  if (!profile || profile.role !== "trainer") {
    return (
      <div className="page-container" style={{ padding: 24, textAlign: "center" }}>
        <p style={{ color: "var(--muted)" }}>Esta sección es solo para entrenadores.</p>
        <button className="ghost" onClick={() => setPage("home")}>Volver</button>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 480, margin: "0 auto", padding: "0 0 80px" }}>
      {/* Header */}
      <div style={{ padding: "16px 16px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <button className="ghost icon-btn" onClick={() => setPage("trainer")}>
          <Icon name="ArrowLeft" size={20} />
        </button>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Mis comisiones</h1>
      </div>

      <div style={{ padding: "16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Icon name="Loader" size={28} className="spin" />
          </div>
        ) : (
          <>
            {/* Link de invitación */}
            <div className="card" style={{ marginBottom: 16 }}>
              <p className="section-label" style={{ marginBottom: 10 }}>Tu link de invitación</p>
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>
                Compartí este link con tus alumnos. Al registrarse quedan vinculados a vos automáticamente.
              </p>
              {inviteCode ? (
                <>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "var(--panel2)", border: "1px solid var(--border)",
                    borderRadius: 10, padding: "10px 12px", marginBottom: 8,
                  }}>
                    <code style={{ flex: 1, fontSize: 12, color: "var(--accent, #a855f7)", wordBreak: "break-all" }}>
                      {window.location.origin}/#/join/{inviteCode}
                    </code>
                    <button className="ghost icon-btn" onClick={copyLink} title="Copiar">
                      <Icon name={copied ? "Check" : "Copy"} size={16} style={{ color: copied ? "var(--green)" : undefined }} />
                    </button>
                  </div>
                  {copied && <p style={{ fontSize: 12, color: "var(--green)", margin: 0 }}>¡Link copiado!</p>}
                </>
              ) : (
                <button className="btn-primary" style={{ width: "100%" }} disabled={generating} onClick={generateCode}>
                  <Icon name="Link" size={14} /> {generating ? "Generando…" : "Generar mi link"}
                </button>
              )}
            </div>

            {/* Progreso hacia mes gratis */}
            <div className="card" style={{ marginBottom: 16, position: "relative", overflow: "hidden" }}>
              {rewardReached && (
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 30%, rgba(168,85,247,.12), transparent 70%)", pointerEvents: "none" }} />
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <p className="section-label" style={{ marginBottom: 2 }}>Recompensa por referidos</p>
                  <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
                    {rewardReached
                      ? `Ganaste ${monthsEarned} mes${monthsEarned > 1 ? "es" : ""} de acceso premium 🎉`
                      : `Llevá ${PAYING_GOAL} alumnos pagando → 1 mes premium gratis`}
                  </p>
                </div>
                {rewardReached && <Icon name="Trophy" size={28} style={{ display:'inline-block', verticalAlign:'middle' }} />}
              </div>

              {/* Barra de progreso */}
              <div style={{ background: "var(--panel2)", borderRadius: 8, height: 10, marginBottom: 8, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(progress / PAYING_GOAL) * 100}%`,
                  background: rewardReached ? "var(--accent, #a855f7)" : "var(--green)",
                  borderRadius: 8,
                  transition: "width 0.6s ease",
                }} />
              </div>
              <p style={{ fontSize: 12, color: "var(--muted)", margin: 0, textAlign: "right" }}>
                {progress}/{PAYING_GOAL} alumnos pagando
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div className="card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text)" }}>{totalStudents}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>alumnos vinculados</div>
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "var(--green)" }}>{paying}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>con suscripción activa</div>
              </div>
            </div>

            {/* Lista de alumnos pagando */}
            {payingStudents.length > 0 && (
              <div className="card" style={{ marginBottom: 16 }}>
                <p className="section-label" style={{ marginBottom: 10 }}>Alumnos activos</p>
                {payingStudents.map(s => (
                  <div key={s.id} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 0", borderBottom: "1px solid var(--border)",
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: "var(--accent, #a855f7)", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0,
                    }}>
                      {(s.name || s.email || "?")[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                        {s.name || s.email}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--green)" }}>
                        Suscripción activa ✓
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Conversiones via link de invitación */}
            {conversions.length > 0 && (
              <div className="card" style={{ marginBottom: 16 }}>
                <p className="section-label" style={{ marginBottom: 10 }}><Icon name="Target" size={14} style={{display:'inline-block',verticalAlign:'middle',marginRight:3}} /> Conversiones via tu link</p>
                {conversions.map(c => {
                  const name = c.profiles?.name || c.profiles?.email?.split("@")[0] || "Alumno";
                  const date = new Date(c.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "short" });
                  return (
                    <div key={c.id} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 0", borderBottom: "1px solid var(--border)",
                    }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: "50%",
                        background: "rgba(34,197,94,.15)", border: "1px solid rgba(34,197,94,.3)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700, color: "var(--green)", flexShrink: 0,
                      }}>
                        {name[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{name}</div>
                        <div style={{ fontSize: 11, color: "var(--green)" }}>Suscripción activada ✓</div>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>{date}</div>
                    </div>
                  );
                })}
                <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--muted)" }}>
                  {conversions.length} alumno{conversions.length !== 1 ? "s" : ""} se suscribieron via tu link
                </p>
              </div>
            )}

            {/* Info de comisiones */}
            <div className="card" style={{ background: "rgba(168,85,247,.06)", border: "1px solid rgba(168,85,247,.15)" }}>
              <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
                <Icon name="Lightbulb" size={14} style={{display:'inline-block',verticalAlign:'middle',marginRight:3}} /> <b style={{ color: "var(--text)" }}>¿Cómo funcionan las comisiones?</b><br/>
                Cada alumno que se suscribe a través de tu link genera una comisión para vos.
                Las comisiones se acreditan mensualmente. Con 5 alumnos pagando, desbloqueás 1 mes de acceso premium.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
