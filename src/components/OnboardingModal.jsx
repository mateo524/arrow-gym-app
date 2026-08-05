import { useState } from "react";
import useStore from "../store/useStore.js";
import useAuthStore from "../store/useAuthStore.js";
import { supabase } from "../lib/supabase.js";

const GOALS = [
  { id: "volumen",       label: "Ganar músculo",  icon: "💪", desc: "Aumentar masa muscular y fuerza" },
  { id: "definicion",    label: "Definición",     icon: "🔥", desc: "Bajar grasa manteniendo músculo" },
  { id: "mantenimiento", label: "Salud general",  icon: "⚖️",  desc: "Mantener el físico y bienestar general" },
  { id: "rendimiento",   label: "Fuerza",         icon: "⚡", desc: "Desarrollar fuerza máxima" },
];

const LEVELS = [
  { id: "principiante", label: "Principiante",  icon: "🌱", desc: "Menos de 1 año entrenando" },
  { id: "intermedio",   label: "Intermedio",    icon: "💪", desc: "1 a 3 años de experiencia" },
  { id: "avanzado",     label: "Avanzado",      icon: "🏆", desc: "Más de 3 años entrenando" },
];

const FEATURES = [
  { icon: "📊", title: "Coach IA en vivo",       desc: "Te sugiere peso, detecta fatiga y sobreentrenamiento en tiempo real durante el entreno." },
  { icon: "📐", title: "Mediciones corporales",  desc: "Registrá peso, % grasa, cintura y más. Encontralo en el tab Medidas del menú." },
  { icon: "🍎", title: "Calculadora de macros",  desc: "Calculá tus calorías y macros diarios según tu objetivo. Está en la sección Coach → Macros." },
  { icon: "🗓", title: "Rutinas y plantillas",   desc: "Creá rutinas o usá plantillas populares (PPL, 5x5, Full Body). En Inicio → Accesos rápidos." },
  { icon: "🔥", title: "Rachas y logros",        desc: "Ganás logros por consistencia y PRs. Mirá tus badges en Inicio → Logros." },
];

export default function OnboardingModal() {
  const markOnboardingSeen = useStore(s => s.markOnboardingSeen);
  const setUserGoal = useStore(s => s.setUserGoal);
  const profile = useAuthStore(s => s.profile);
  const refreshProfile = useAuthStore(s => s.refreshProfile);

  const [step, setStep] = useState(1); // 1=welcome, 2=body, 3=level+goal, 4=features, 5=trial+trainer
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState("");
  const [goal, setGoal] = useState("mantenimiento");
  const [level, setLevel] = useState("intermedio");
  const [saving, setSaving] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [connectingTrainer, setConnectingTrainer] = useState(false);

  async function connectTrainer() {
    if (!inviteCode.trim()) return;
    setConnectingTrainer(true);
    setInviteMsg("");
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("invite_code", inviteCode.trim().toUpperCase())
        .eq("role", "trainer")
        .single();
      if (error || !data) { setInviteMsg("Código no válido. Pedíselo a tu entrenador."); setConnectingTrainer(false); return; }
      await supabase.from("trainer_clients").upsert({ trainer_id: data.id, client_id: profile.id }, { onConflict: "trainer_id,client_id" });
      await supabase.from("profiles").update({ trainer_id: data.id }).eq("id", profile.id);
      refreshProfile?.();
      setInviteMsg(`✓ Conectado con ${data.name}`);
    } catch {
      setInviteMsg("Error de conexión. Intentá de nuevo.");
    }
    setConnectingTrainer(false);
  }

  async function finish() {
    setSaving(true);
    const payload = { goal, fitness_level: level };
    if (weight) payload.weight_kg    = parseFloat(weight);
    if (height) payload.height_cm    = parseFloat(height);
    if (dob)    payload.date_of_birth = dob;
    if (sex)    payload.sex           = sex;

    if (profile?.id) {
      try { await supabase.from("profiles").update(payload).eq("id", profile.id); } catch {}
      refreshProfile?.();
    }
    setUserGoal(goal);
    markOnboardingSeen();
    setSaving(false);
  }

  const TOTAL_STEPS = 5;
  const inputStyle = { width: "100%", background: "var(--panel)", border: "1.5px solid var(--border)", borderRadius: 12, padding: "12px 16px", color: "var(--text)", fontSize: 16, boxSizing: "border-box" };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.88)", zIndex: 9000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: "var(--bg)", borderRadius: "24px 24px 0 0", padding: "28px 24px 52px", width: "100%", maxWidth: 480, maxHeight: "92vh", overflow: "auto" }}>

        {/* Progress bar */}
        <div style={{ display: "flex", gap: 5, marginBottom: 28 }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2, transition: "background 0.3s",
              background: i < step ? "var(--green)" : "var(--panel2)",
            }} />
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 58, marginBottom: 12 }}>⚡</div>
              <h2 style={{ margin: "0 0 10px", fontSize: 26 }}>Bienvenido a Loop</h2>
              <p style={{ color: "var(--muted)", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                En 4 pasos rápidos configuramos tu experiencia personalizada.
              </p>
            </div>
            <div style={{ background: "rgba(168,85,247,.06)", border: "1px solid rgba(168,85,247,.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 24 }}>
              <p style={{ margin: "0 0 6px", fontSize: 13, color: "var(--green)", fontWeight: 700 }}>¿Para qué usamos tus datos?</p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
                Tu peso y altura permiten calcular calorías y macros. Tu nivel y objetivo ajustan los consejos del coach. Todo queda solo en tu cuenta.
              </p>
            </div>
            <button className="primary big" style={{ width: "100%" }} onClick={() => setStep(2)}>Empezar →</button>
          </>
        )}

        {/* Step 2: Body measurements */}
        {step === 2 && (
          <>
            <h2 style={{ margin: "0 0 4px", fontSize: 22 }}>Tus medidas básicas</h2>
            <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 20px", lineHeight: 1.5 }}>
              Podés completarlas ahora o después en <b>Medidas</b>.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Peso actual (kg)</label>
                <input type="number" inputMode="decimal" value={weight} onChange={e => setWeight(e.target.value)} placeholder="ej: 75" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Altura (cm)</label>
                <input type="number" inputMode="numeric" value={height} onChange={e => setHeight(e.target.value)} placeholder="ej: 175" style={inputStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Fecha de nacimiento</label>
                  <input type="date" value={dob} onChange={e => setDob(e.target.value)} style={{ ...inputStyle, fontSize: 14 }} />
                </div>
                <div>
                  <label style={labelStyle}>Sexo biológico</label>
                  <div style={{ display: "flex", gap: 8, height: 48 }}>
                    {[{id:"M", label:"Masc."}, {id:"F", label:"Fem."}].map(o => (
                      <button key={o.id} onClick={() => setSex(o.id)} style={{
                        flex: 1, borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 13,
                        background: sex === o.id ? "rgba(168,85,247,.1)" : "var(--panel)",
                        border: `1.5px solid ${sex === o.id ? "var(--green)" : "var(--border)"}`,
                        color: sex === o.id ? "var(--green)" : "var(--text)",
                      }}>{o.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: "rgba(96,165,250,.06)", border: "1px solid rgba(96,165,250,.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 20 }}>
              <p style={{ margin: 0, fontSize: 12, color: "#60a5fa", lineHeight: 1.5 }}>
                💡 Para % grasa corporal, perímetros y seguimiento avanzado → <b>Medidas</b> en el menú inferior.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>← Atrás</button>
              <button className="primary" style={{ flex: 2 }} onClick={() => setStep(3)}>Continuar →</button>
            </div>
          </>
        )}

        {/* Step 3: Level + Goal */}
        {step === 3 && (
          <>
            <h2 style={{ margin: "0 0 4px", fontSize: 22 }}>Tu nivel y objetivo</h2>
            <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 16px" }}>El coach adapta sus consejos a tu experiencia.</p>

            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Nivel de experiencia</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {LEVELS.map(l => (
                <button key={l.id} onClick={() => setLevel(l.id)} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                  background: level === l.id ? "rgba(168,85,247,.1)" : "var(--panel)",
                  border: `2px solid ${level === l.id ? "var(--green)" : "var(--border)"}`,
                  borderRadius: 12, cursor: "pointer", textAlign: "left",
                }}>
                  <span style={{ fontSize: 24 }}>{l.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: level === l.id ? "var(--green)" : "var(--text)" }}>{l.label}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{l.desc}</div>
                  </div>
                  {level === l.id && <span style={{ marginLeft: "auto", color: "var(--green)" }}>✓</span>}
                </button>
              ))}
            </div>

            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Objetivo principal</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {GOALS.map(g => (
                <button key={g.id} onClick={() => setGoal(g.id)} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                  background: goal === g.id ? "rgba(168,85,247,.1)" : "var(--panel)",
                  border: `2px solid ${goal === g.id ? "var(--green)" : "var(--border)"}`,
                  borderRadius: 12, cursor: "pointer", textAlign: "left",
                }}>
                  <span style={{ fontSize: 22 }}>{g.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: goal === g.id ? "var(--green)" : "var(--text)" }}>{g.label}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{g.desc}</div>
                  </div>
                  {goal === g.id && <span style={{ marginLeft: "auto", color: "var(--green)" }}>✓</span>}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="ghost" style={{ flex: 1 }} onClick={() => setStep(2)}>← Atrás</button>
              <button className="primary" style={{ flex: 2 }} onClick={() => setStep(4)}>Continuar →</button>
            </div>
          </>
        )}

        {/* Step 4: Feature discovery */}
        {step === 4 && (
          <>
            <h2 style={{ margin: "0 0 4px", fontSize: 22 }}>Lo que podés hacer</h2>
            <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 18px" }}>Loop tiene todo esto para vos:</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {FEATURES.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 14px", background: "var(--panel)", borderRadius: 14, border: "1px solid var(--line)" }}>
                  <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{f.title}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="ghost" style={{ flex: 1 }} onClick={() => setStep(3)}>← Atrás</button>
              <button className="primary" style={{ flex: 2 }} onClick={() => setStep(5)}>Continuar →</button>
            </div>
          </>
        )}

        {/* Step 5: Trainer connection + trial awareness */}
        {step === 5 && (
          <>
            <h2 style={{ margin: "0 0 4px", fontSize: 22 }}>¡Casi listo!</h2>
            <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 20px", lineHeight: 1.5 }}>
              {profile?.trainer_id ? "Ya estás conectado con tu entrenador 🎉" : "Si tenés un entrenador en Loop, conectate ahora con su código."}
            </p>

            {!profile?.trainer_id ? (
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>
                  Código de entrenador (opcional)
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="Ej: ABC123"
                    maxLength={8}
                    style={{ flex: 1, background: "var(--panel)", border: "1.5px solid var(--border)", borderRadius: 12, padding: "12px 16px", color: "var(--text)", fontSize: 16, textTransform: "uppercase", letterSpacing: "0.1em" }}
                  />
                  <button
                    className="primary"
                    onClick={connectTrainer}
                    disabled={connectingTrainer || !inviteCode.trim()}
                    style={{ padding: "12px 16px", borderRadius: 12, flexShrink: 0 }}
                  >
                    {connectingTrainer ? "…" : "Conectar"}
                  </button>
                </div>
                {inviteMsg && (
                  <p style={{ margin: "8px 0 0", fontSize: 13, color: inviteMsg.startsWith("✓") ? "var(--green)" : "var(--danger)" }}>
                    {inviteMsg}
                  </p>
                )}
                <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
                  ¿No tenés código? Podés empezar solo y conectarte después desde <b>Perfil</b>.
                </p>
              </div>
            ) : (
              <div style={{ background: "rgba(52,211,153,.08)", border: "1px solid rgba(52,211,153,.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 28 }}>🏋️</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--green)" }}>Entrenador conectado</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Tu entrenador puede ver tu progreso y asignarte rutinas.</div>
                </div>
              </div>
            )}

            {/* Trial awareness */}
            <div style={{ background: "rgba(168,85,247,.06)", border: "1px solid rgba(168,85,247,.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>⏳ 30 días de prueba gratuita</div>
              <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
                Tenés 30 días para probar Loop sin pagar nada. Si querés seguir, la suscripción es <b style={{ color: "var(--text)" }}>$25.000 ARS/mes</b> — te avisamos antes de que venza.
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="ghost" style={{ flex: 1 }} onClick={() => setStep(4)}>← Atrás</button>
              <button className="primary" style={{ flex: 2 }} disabled={saving} onClick={finish}>
                {saving ? "Guardando…" : "¡Empezar! 🚀"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

