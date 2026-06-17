import { useState } from "react";
import useStore from "../store/useStore.js";
import useAuthStore from "../store/useAuthStore.js";
import { supabase } from "../lib/supabase.js";
import Icon from "../components/Icon.jsx";

function WeightSparkline({ data }) {
  if (!data || data.length < 2) return null;
  const pts = data.slice(-8);
  const vals = pts.map((p) => p.kg);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const W = 100, H = 28;
  const points = pts
    .map((p, i) => {
      const x = (i / (pts.length - 1)) * W;
      const y = H - ((p.kg - min) / range) * (H - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <polyline points={points} fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IndexCard({ label, value, unit, category, categoryColor }) {
  if (value === null || value === undefined || isNaN(value)) return null;
  return (
    <div style={{ background: "var(--panel2)", borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <b style={{ fontSize: 22, color: "var(--green)" }}>{value}</b>
          <span style={{ fontSize: 13, color: "var(--muted)", marginLeft: 6 }}>{unit}</span>
        </div>
        {category && (
          <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: categoryColor + "22", color: categoryColor }}>
            {category}
          </span>
        )}
      </div>
      <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--muted)" }}>{label}</p>
    </div>
  );
}

const TAB_STYLE_BASE = {
  flex: 1,
  padding: "9px 4px",
  fontSize: 12,
  fontWeight: 500,
  background: "none",
  border: "none",
  borderBottom: "2px solid transparent",
  color: "var(--muted)",
  cursor: "pointer",
  transition: "color 0.15s, border-color 0.15s",
  whiteSpace: "nowrap",
};

const TAB_STYLE_ACTIVE = {
  ...TAB_STYLE_BASE,
  color: "var(--green)",
  borderBottom: "2px solid var(--green)",
};

export default function ProfilePage() {
  const setPage = useStore((s) => s.setPage);
  const amoled = useStore((s) => s.amoled);
  const soundEnabled = useStore((s) => s.soundEnabled);
  const toggleAmoled = useStore((s) => s.toggleAmoled);
  const toggleSound = useStore((s) => s.toggleSound);
  const profile = useAuthStore((s) => s.profile);
  const logout = useAuthStore((s) => s.logout);
  const logWeight = useStore((s) => s.logWeight);
  const weightLog = useStore((s) => s.weightLog) || [];
  const [todayKg, setTodayKg] = useState("");

  const [showChangePwd, setShowChangePwd] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState("");
  const [nameMsg, setNameMsg] = useState("");

  // Tab state
  const [measTab, setMeasTab] = useState("basico");

  // Tab 1: Básico
  const [editBasico, setEditBasico] = useState(false);
  const [measWeight, setMeasWeight] = useState("");
  const [measHeight, setMeasHeight] = useState("");
  const [measAge, setMeasAge] = useState("");
  const [basicoMsg, setBasicoMsg] = useState("");

  // Tab 2: Pliegues
  const [editPliegues, setEditPliegues] = useState(false);
  const [plieguesMsg, setPlieguesMsg] = useState("");
  const [triceps, setTriceps] = useState("");
  const [subscapular, setSubscapular] = useState("");
  const [biceps, setBiceps] = useState("");
  const [iliacCrest, setIliacCrest] = useState("");
  const [supraspinal, setSupraspinal] = useState("");
  const [abdominal, setAbdominal] = useState("");
  const [frontThigh, setFrontThigh] = useState("");
  const [medialCalf, setMedialCalf] = useState("");

  // Tab 3: Perímetros y Diámetros
  const [editPerimetros, setEditPerimetros] = useState(false);
  const [perimetrosMsg, setPerimetrosMsg] = useState("");
  const [armRelaxed, setArmRelaxed] = useState("");
  const [armFlexed, setArmFlexed] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [calfPer, setCalfPer] = useState("");
  const [humerus, setHumerus] = useState("");
  const [femur, setFemur] = useState("");

  const name = profile?.name || profile?.email?.split("@")[0] || "Atleta";
  const initial = name[0].toUpperCase();
  const role = profile?.role;

  async function saveName(e) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    const { error } = await supabase.from("profiles").update({ name: trimmed }).eq("id", profile.id);
    if (error) {
      setNameMsg("Error: " + error.message);
    } else {
      useAuthStore.setState({ profile: { ...profile, name: trimmed } });
      setNameMsg("✓ Nombre actualizado");
      setTimeout(() => { setEditName(false); setNameMsg(""); }, 1200);
    }
  }

  function openBasico() {
    setMeasWeight(String(profile?.weight_kg || ""));
    setMeasHeight(String(profile?.height_cm || ""));
    setMeasAge(String(profile?.age || ""));
    setBasicoMsg("");
    setEditBasico(true);
  }

  async function saveBasico(e) {
    e.preventDefault();
    const payload = {};
    if (measWeight) payload.weight_kg = Number(measWeight);
    if (measHeight) payload.height_cm = Number(measHeight);
    if (measAge) payload.age = Number(measAge);
    const { error } = await supabase.from("profiles").update(payload).eq("id", profile.id);
    if (error) {
      setBasicoMsg("Error al guardar: " + error.message);
    } else {
      useAuthStore.setState({ profile: { ...profile, ...payload } });
      setBasicoMsg("✓ Medidas guardadas");
      setTimeout(() => { setEditBasico(false); setBasicoMsg(""); }, 1200);
    }
  }

  function openPliegues() {
    setTriceps(String(profile?.triceps_mm || ""));
    setSubscapular(String(profile?.subscapular_mm || ""));
    setBiceps(String(profile?.biceps_mm || ""));
    setIliacCrest(String(profile?.iliac_crest_mm || ""));
    setSupraspinal(String(profile?.supraspinal_mm || ""));
    setAbdominal(String(profile?.abdominal_mm || ""));
    setFrontThigh(String(profile?.front_thigh_mm || ""));
    setMedialCalf(String(profile?.medial_calf_mm || ""));
    setPlieguesMsg("");
    setEditPliegues(true);
  }

  async function savePliegues(e) {
    e.preventDefault();
    const payload = {};
    if (triceps) payload.triceps_mm = Number(triceps);
    if (subscapular) payload.subscapular_mm = Number(subscapular);
    if (biceps) payload.biceps_mm = Number(biceps);
    if (iliacCrest) payload.iliac_crest_mm = Number(iliacCrest);
    if (supraspinal) payload.supraspinal_mm = Number(supraspinal);
    if (abdominal) payload.abdominal_mm = Number(abdominal);
    if (frontThigh) payload.front_thigh_mm = Number(frontThigh);
    if (medialCalf) payload.medial_calf_mm = Number(medialCalf);
    const { error } = await supabase.from("profiles").update(payload).eq("id", profile.id);
    if (error) {
      setPlieguesMsg("Error al guardar: " + error.message);
    } else {
      useAuthStore.setState({ profile: { ...profile, ...payload } });
      setPlieguesMsg("✓ Pliegues guardados");
      setTimeout(() => { setEditPliegues(false); setPlieguesMsg(""); }, 1200);
    }
  }

  function openPerimetros() {
    setArmRelaxed(String(profile?.arm_relaxed_cm || ""));
    setArmFlexed(String(profile?.arm_flexed_cm || ""));
    setWaist(String(profile?.waist_cm || ""));
    setHip(String(profile?.hip_cm || ""));
    setCalfPer(String(profile?.calf_cm || ""));
    setHumerus(String(profile?.humerus_cm || ""));
    setFemur(String(profile?.femur_cm || ""));
    setPerimetrosMsg("");
    setEditPerimetros(true);
  }

  async function savePerimetros(e) {
    e.preventDefault();
    const payload = {};
    if (armRelaxed) payload.arm_relaxed_cm = Number(armRelaxed);
    if (armFlexed) payload.arm_flexed_cm = Number(armFlexed);
    if (waist) payload.waist_cm = Number(waist);
    if (hip) payload.hip_cm = Number(hip);
    if (calfPer) payload.calf_cm = Number(calfPer);
    if (humerus) payload.humerus_cm = Number(humerus);
    if (femur) payload.femur_cm = Number(femur);
    const { error } = await supabase.from("profiles").update(payload).eq("id", profile.id);
    if (error) {
      setPerimetrosMsg("Error al guardar: " + error.message);
    } else {
      useAuthStore.setState({ profile: { ...profile, ...payload } });
      setPerimetrosMsg("✓ Medidas guardadas");
      setTimeout(() => { setEditPerimetros(false); setPerimetrosMsg(""); }, 1200);
    }
  }

  async function handleChangePwd(e) {
    e.preventDefault();
    if (newPwd !== confirmPwd) { setPwdMsg("Las contraseñas no coinciden."); return; }
    if (newPwd.length < 6) { setPwdMsg("Mínimo 6 caracteres."); return; }
    setSavingPwd(true);
    setPwdMsg("");
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setSavingPwd(false);
    if (error) {
      setPwdMsg("Error: " + error.message);
    } else {
      setPwdMsg("✓ Contraseña actualizada");
      setNewPwd(""); setConfirmPwd("");
      setTimeout(() => { setShowChangePwd(false); setPwdMsg(""); }, 1500);
    }
  }

  // Calculated indices
  const wKg = profile?.weight_kg;
  const hCm = profile?.height_cm;
  const wstCm = profile?.waist_cm;
  const hipCm = profile?.hip_cm;

  const imc = wKg && hCm ? wKg / Math.pow(hCm / 100, 2) : null;
  let imcCategory = null, imcColor = "var(--muted)";
  if (imc !== null) {
    if (imc < 18.5) { imcCategory = "Bajo peso"; imcColor = "#3b9eff"; }
    else if (imc < 25) { imcCategory = "Normal"; imcColor = "var(--green)"; }
    else if (imc < 30) { imcCategory = "Sobrepeso"; imcColor = "#f5a623"; }
    else { imcCategory = "Obesidad"; imcColor = "#e74c3c"; }
  }

  const whr = wstCm && hipCm ? wstCm / hipCm : null;
  let whrCategory = null, whrColor = "var(--muted)";
  if (whr !== null) {
    if (whr < 0.90) { whrCategory = "Saludable"; whrColor = "var(--green)"; }
    else { whrCategory = "Alto riesgo"; whrColor = "#e74c3c"; }
  }

  const t = profile?.triceps_mm;
  const ss = profile?.subscapular_mm;
  const sp = profile?.supraspinal_mm;
  const ab = profile?.abdominal_mm;
  const ft = profile?.front_thigh_mm;
  const mc = profile?.medial_calf_mm;
  const bic = profile?.biceps_mm;
  const ic = profile?.iliac_crest_mm;

  let grasaYuhasz = null;
  if (t && ss && sp && ab && ft && mc) {
    const sum6 = t + ss + sp + ab + ft + mc;
    grasaYuhasz = (sum6 * 0.097) + 3.64;
  }

  let grasaDurnin = null;
  if (t && ss && bic && ic) {
    const sum4 = t + ss + bic + ic;
    grasaDurnin = ((4.95 / (1.1765 - 0.0744 * Math.log10(sum4))) - 4.5) * 100;
  }

  function fatColor(pct) {
    if (pct === null) return "var(--muted)";
    if (pct < 10) return "#3b9eff";
    if (pct < 20) return "var(--green)";
    if (pct < 25) return "#f5a623";
    return "#e74c3c";
  }

  const inputStyle = {
    background: "var(--panel2)",
    border: "1px solid var(--line)",
    borderRadius: 10,
    padding: "9px 10px",
    color: "var(--text)",
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box",
  };

  const fieldGroupStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    fontSize: 12,
    color: "var(--muted)",
  };

  return (
    <section className="page">
      <div className="page-head">
        <button className="back-btn" onClick={() => setPage("home")} aria-label="Volver">
          <Icon name="ArrowLeft" size={20} strokeWidth={2.5} />
        </button>
        <div className="page-head-titles">
          <p className="eyebrow">Mi cuenta</p>
          <h1>Perfil</h1>
        </div>
      </div>

      {/* Avatar + info */}
      <div className="profile-hero">
        <div className="profile-avatar-lg">{initial}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editName ? (
            <form onSubmit={saveName} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ flex: 1, background: "var(--panel2)", border: "1px solid var(--green)", borderRadius: 10, padding: "7px 10px", color: "var(--text)", fontSize: 14, minWidth: 0 }}
                placeholder="Tu nombre"
              />
              <button type="submit" className="primary" style={{ padding: "8px 12px", fontSize: 13, borderRadius: 10 }}>✓</button>
              <button type="button" className="ghost" style={{ padding: "8px 12px", fontSize: 13, borderRadius: 10 }} onClick={() => setEditName(false)}>✕</button>
            </form>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <strong style={{ fontSize: 16 }}>{name}</strong>
              <button
                className="ghost"
                style={{ padding: "4px 8px", fontSize: 11, borderRadius: 8, color: "var(--muted)" }}
                onClick={() => { setNewName(name); setEditName(true); setNameMsg(""); }}
              >Editar</button>
            </div>
          )}
          {nameMsg && <small style={{ color: nameMsg.startsWith("✓") ? "var(--green)" : "var(--danger)" }}>{nameMsg}</small>}
          <small>{profile?.email}</small>
          <span className="role-badge">{role}</span>
        </div>
      </div>

      {/* Body measurements — 4-tab system */}
      <div className="card" style={{ marginBottom: 14 }}>
        <h2 style={{ margin: "0 0 12px" }}>Medidas corporales</h2>

        {/* Tab bar */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--line)", marginBottom: 16, gap: 0 }}>
          {[
            { id: "basico", label: "Básico" },
            { id: "pliegues", label: "Pliegues" },
            { id: "perimetros", label: "Perímetros" },
            { id: "indices", label: "Índices" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setMeasTab(id)}
              style={measTab === id ? TAB_STYLE_ACTIVE : TAB_STYLE_BASE}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab 1: Básico */}
        {measTab === "basico" && (
          <>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              {!editBasico && (
                <button className="ghost" style={{ padding: "8px 14px", fontSize: 13 }} onClick={openBasico}>
                  {profile?.weight_kg ? "Editar" : "Agregar"}
                </button>
              )}
            </div>
            {!editBasico ? (
              profile?.weight_kg || profile?.height_cm || profile?.age ? (
                <div className="stats-grid" style={{ marginTop: 4 }}>
                  {profile.weight_kg && <div><b>{profile.weight_kg}</b><span>kg</span></div>}
                  {profile.height_cm && <div><b>{profile.height_cm}</b><span>cm</span></div>}
                  {profile.age && <div><b>{profile.age}</b><span>años</span></div>}
                </div>
              ) : (
                <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
                  Aún no cargaste tus medidas básicas.
                </p>
              )
            ) : (
              <form onSubmit={saveBasico} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="quick-grid">
                  <label className="field-group">
                    Peso (kg)
                    <input inputMode="decimal" value={measWeight} onChange={(e) => setMeasWeight(e.target.value)} placeholder="ej: 75" />
                  </label>
                  <label className="field-group">
                    Altura (cm)
                    <input inputMode="decimal" value={measHeight} onChange={(e) => setMeasHeight(e.target.value)} placeholder="ej: 175" />
                  </label>
                </div>
                <label className="field-group">
                  Edad
                  <input inputMode="numeric" value={measAge} onChange={(e) => setMeasAge(e.target.value)} placeholder="ej: 25" />
                </label>
                {basicoMsg && (
                  <div className={basicoMsg.startsWith("✓") ? "success-msg" : "login-error"}>
                    <Icon name={basicoMsg.startsWith("✓") ? "CheckCircle" : "AlertCircle"} size={14} />
                    <span>{basicoMsg}</span>
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="ghost" style={{ flex: 1 }} onClick={() => setEditBasico(false)}>Cancelar</button>
                  <button type="submit" className="primary" style={{ flex: 1 }}>Guardar</button>
                </div>
              </form>
            )}
          </>
        )}

        {/* Tab 2: Pliegues cutáneos */}
        {measTab === "pliegues" && (
          <>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              {!editPliegues && (
                <button className="ghost" style={{ padding: "8px 14px", fontSize: 13 }} onClick={openPliegues}>
                  {profile?.triceps_mm ? "Editar" : "Agregar"}
                </button>
              )}
            </div>
            {!editPliegues ? (
              profile?.triceps_mm || profile?.subscapular_mm || profile?.biceps_mm ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { label: "Tríceps", val: profile?.triceps_mm },
                    { label: "Subescapular", val: profile?.subscapular_mm },
                    { label: "Bíceps", val: profile?.biceps_mm },
                    { label: "Cresta ilíaca", val: profile?.iliac_crest_mm },
                    { label: "Supraspinal", val: profile?.supraspinal_mm },
                    { label: "Abdominal", val: profile?.abdominal_mm },
                    { label: "Muslo anterior", val: profile?.front_thigh_mm },
                    { label: "Pantorrilla medial", val: profile?.medial_calf_mm },
                  ].map(({ label, val }) => val ? (
                    <div key={label} style={{ background: "var(--panel2)", borderRadius: 10, padding: "8px 10px" }}>
                      <b style={{ fontSize: 16 }}>{val}</b>
                      <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 4 }}>mm</span>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--muted)" }}>{label}</p>
                    </div>
                  ) : null)}
                </div>
              ) : (
                <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
                  Aún no cargaste los pliegues cutáneos.
                </p>
              )
            ) : (
              <form onSubmit={savePliegues} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Tríceps (mm)", val: triceps, set: setTriceps },
                    { label: "Subescapular (mm)", val: subscapular, set: setSubscapular },
                    { label: "Bíceps (mm)", val: biceps, set: setBiceps },
                    { label: "Cresta ilíaca (mm)", val: iliacCrest, set: setIliacCrest },
                    { label: "Supraspinal (mm)", val: supraspinal, set: setSupraspinal },
                    { label: "Abdominal (mm)", val: abdominal, set: setAbdominal },
                    { label: "Muslo anterior (mm)", val: frontThigh, set: setFrontThigh },
                    { label: "Pantorrilla medial (mm)", val: medialCalf, set: setMedialCalf },
                  ].map(({ label, val, set }) => (
                    <label key={label} style={fieldGroupStyle}>
                      {label}
                      <input inputMode="decimal" value={val} onChange={(e) => set(e.target.value)} placeholder="mm" style={inputStyle} />
                    </label>
                  ))}
                </div>
                {plieguesMsg && (
                  <div className={plieguesMsg.startsWith("✓") ? "success-msg" : "login-error"}>
                    <Icon name={plieguesMsg.startsWith("✓") ? "CheckCircle" : "AlertCircle"} size={14} />
                    <span>{plieguesMsg}</span>
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="ghost" style={{ flex: 1 }} onClick={() => setEditPliegues(false)}>Cancelar</button>
                  <button type="submit" className="primary" style={{ flex: 1 }}>Guardar</button>
                </div>
              </form>
            )}
          </>
        )}

        {/* Tab 3: Perímetros y Diámetros */}
        {measTab === "perimetros" && (
          <>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              {!editPerimetros && (
                <button className="ghost" style={{ padding: "8px 14px", fontSize: 13 }} onClick={openPerimetros}>
                  {profile?.arm_relaxed_cm ? "Editar" : "Agregar"}
                </button>
              )}
            </div>
            {!editPerimetros ? (
              profile?.arm_relaxed_cm || profile?.waist_cm || profile?.hip_cm ? (
                <>
                  <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Perímetros</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                    {[
                      { label: "Brazo relajado", val: profile?.arm_relaxed_cm },
                      { label: "Brazo contraído", val: profile?.arm_flexed_cm },
                      { label: "Cintura", val: profile?.waist_cm },
                      { label: "Caderas", val: profile?.hip_cm },
                      { label: "Pantorrilla", val: profile?.calf_cm },
                    ].map(({ label, val }) => val ? (
                      <div key={label} style={{ background: "var(--panel2)", borderRadius: 10, padding: "8px 10px" }}>
                        <b style={{ fontSize: 16 }}>{val}</b>
                        <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 4 }}>cm</span>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--muted)" }}>{label}</p>
                      </div>
                    ) : null)}
                  </div>
                  {(profile?.humerus_cm || profile?.femur_cm) && (
                    <>
                      <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Diámetros</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {[
                          { label: "Húmero", val: profile?.humerus_cm },
                          { label: "Fémur", val: profile?.femur_cm },
                        ].map(({ label, val }) => val ? (
                          <div key={label} style={{ background: "var(--panel2)", borderRadius: 10, padding: "8px 10px" }}>
                            <b style={{ fontSize: 16 }}>{val}</b>
                            <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 4 }}>cm</span>
                            <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--muted)" }}>{label}</p>
                          </div>
                        ) : null)}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
                  Aún no cargaste perímetros ni diámetros.
                </p>
              )
            ) : (
              <form onSubmit={savePerimetros} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: 11, color: "var(--muted)", margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Perímetros</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Brazo relajado (cm)", val: armRelaxed, set: setArmRelaxed },
                    { label: "Brazo contraído (cm)", val: armFlexed, set: setArmFlexed },
                    { label: "Cintura (cm)", val: waist, set: setWaist },
                    { label: "Caderas (cm)", val: hip, set: setHip },
                    { label: "Pantorrilla (cm)", val: calfPer, set: setCalfPer },
                  ].map(({ label, val, set }) => (
                    <label key={label} style={fieldGroupStyle}>
                      {label}
                      <input inputMode="decimal" value={val} onChange={(e) => set(e.target.value)} placeholder="cm" style={inputStyle} />
                    </label>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: "var(--muted)", margin: "4px 0 0", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Diámetros</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Húmero (cm)", val: humerus, set: setHumerus },
                    { label: "Fémur (cm)", val: femur, set: setFemur },
                  ].map(({ label, val, set }) => (
                    <label key={label} style={fieldGroupStyle}>
                      {label}
                      <input inputMode="decimal" value={val} onChange={(e) => set(e.target.value)} placeholder="cm" style={inputStyle} />
                    </label>
                  ))}
                </div>
                {perimetrosMsg && (
                  <div className={perimetrosMsg.startsWith("✓") ? "success-msg" : "login-error"}>
                    <Icon name={perimetrosMsg.startsWith("✓") ? "CheckCircle" : "AlertCircle"} size={14} />
                    <span>{perimetrosMsg}</span>
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="ghost" style={{ flex: 1 }} onClick={() => setEditPerimetros(false)}>Cancelar</button>
                  <button type="submit" className="primary" style={{ flex: 1 }}>Guardar</button>
                </div>
              </form>
            )}
          </>
        )}

        {/* Tab 4: Índices calculados */}
        {measTab === "indices" && (
          <>
            {imc === null && whr === null && grasaYuhasz === null && grasaDurnin === null ? (
              <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
                Completá las medidas básicas, pliegues y perímetros para ver los índices calculados.
              </p>
            ) : (
              <>
                <IndexCard
                  label="Índice de Masa Corporal (IMC)"
                  value={imc !== null ? imc.toFixed(1) : null}
                  unit="kg/m²"
                  category={imcCategory}
                  categoryColor={imcColor}
                />
                <IndexCard
                  label="Índice Cintura-Cadera (WHR)"
                  value={whr !== null ? whr.toFixed(2) : null}
                  unit="ratio"
                  category={whrCategory}
                  categoryColor={whrColor}
                />
                <IndexCard
                  label="% Grasa corporal — Yuhasz (6 pliegues)"
                  value={grasaYuhasz !== null ? grasaYuhasz.toFixed(1) : null}
                  unit="%"
                  category={grasaYuhasz !== null ? (grasaYuhasz < 15 ? "Atlético" : grasaYuhasz < 20 ? "Normal" : grasaYuhasz < 25 ? "Elevado" : "Alto") : null}
                  categoryColor={grasaYuhasz !== null ? fatColor(grasaYuhasz) : "var(--muted)"}
                />
                <IndexCard
                  label="% Grasa corporal — Durnin-Womersley (4 pliegues)"
                  value={grasaDurnin !== null ? grasaDurnin.toFixed(1) : null}
                  unit="%"
                  category={grasaDurnin !== null ? (grasaDurnin < 15 ? "Atlético" : grasaDurnin < 20 ? "Normal" : grasaDurnin < 25 ? "Elevado" : "Alto") : null}
                  categoryColor={grasaDurnin !== null ? fatColor(grasaDurnin) : "var(--muted)"}
                />
              </>
            )}
          </>
        )}
      </div>

      {/* Body weight log */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>Peso corporal</h2>
          <WeightSparkline data={weightLog} />
        </div>
        {weightLog.length > 0 && (
          <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--muted)" }}>
            Último: <b style={{ color: "var(--text)" }}>{weightLog[0]?.kg} kg</b>
            <span style={{ marginLeft: 8 }}>{weightLog[0]?.date}</span>
          </p>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            inputMode="decimal"
            placeholder="kg de hoy"
            value={todayKg}
            onChange={(e) => setTodayKg(e.target.value)}
            style={{
              flex: 1, background: "var(--panel2)", border: "1px solid var(--line)",
              borderRadius: 12, padding: "10px 12px", color: "var(--text)", fontSize: 15,
            }}
          />
          <button
            className="primary"
            style={{ padding: "10px 18px" }}
            disabled={!todayKg}
            onClick={() => { if (todayKg) { logWeight(todayKg); setTodayKg(""); } }}
          >
            +
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="card">
        <h2>Configuración</h2>

        <div className="settings-row">
          <div><label>Modo AMOLED</label><small>Fondo negro puro para pantallas OLED</small></div>
          <button className={`toggle${amoled ? " on" : ""}`} onClick={toggleAmoled} aria-pressed={amoled} />
        </div>

        <div className="settings-row">
          <div><label>Sonido descanso</label><small>Beep al terminar el temporizador</small></div>
          <button className={`toggle${soundEnabled ? " on" : ""}`} onClick={toggleSound} aria-pressed={soundEnabled} />
        </div>

        <div className="settings-row">
          <div><label>Contraseña</label><small>Cambiá tu contraseña</small></div>
          <button className="ghost" style={{ padding: "8px 14px", fontSize: 13 }}
            onClick={() => { setShowChangePwd(!showChangePwd); setPwdMsg(""); }}>
            Cambiar
          </button>
        </div>

        {showChangePwd && (
          <form onSubmit={handleChangePwd} style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            <div className="field-group">
              <label>Nueva contraseña</label>
              <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Mínimo 6 caracteres" autoComplete="new-password" required minLength={6} />
            </div>
            <div className="field-group">
              <label>Confirmar contraseña</label>
              <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Repetí la contraseña" autoComplete="new-password" required />
            </div>
            {pwdMsg && (
              <div className={pwdMsg.startsWith("✓") ? "success-msg" : "login-error"}>
                <Icon name={pwdMsg.startsWith("✓") ? "CheckCircle" : "AlertCircle"} size={14} />
                <span>{pwdMsg}</span>
              </div>
            )}
            <button type="submit" className="primary" style={{ width: "100%" }} disabled={savingPwd}>
              {savingPwd ? "Guardando…" : "Guardar contraseña"}
            </button>
          </form>
        )}
      </div>

      {/* Logout */}
      <button className="ghost danger-btn" style={{ width: "100%", marginTop: 14 }}
        onClick={() => setShowLogoutConfirm(true)}>
        <Icon name="LogOut" size={16} /> Cerrar sesión
      </button>

      {/* Logout confirm modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal-card confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
              <Icon name="LogOut" size={32} style={{ color: "var(--danger)" }} />
              <h2 style={{ margin: "12px 0 6px" }}>¿Cerrar sesión?</h2>
              <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
                Vas a salir de tu cuenta en este dispositivo.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="ghost" style={{ flex: 1 }} onClick={() => setShowLogoutConfirm(false)}>
                Cancelar
              </button>
              <button className="primary" style={{ flex: 1, background: "var(--danger)", color: "#fff" }}
                onClick={logout}>
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
