import { useState } from "react";
import useStore from "../store/useStore.js";
import Icon from "../components/Icon.jsx";

function PlatformCard({ icon, name, desc, status, onConnect, onExport, connected, instructions }) {
  const [showInstructions, setShowInstructions] = useState(false);
  return (
    <div style={{ background:"var(--panel)", border:"1px solid var(--line)", borderRadius:16, padding:"16px", marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
        <span style={{ fontSize:32 }}>{icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:800, color:"var(--text)" }}>{name}</div>
          <div style={{ fontSize:12, color:"var(--muted)" }}>{desc}</div>
        </div>
        {connected ? (
          <span style={{ background:"rgba(168,85,247,.12)", border:"1px solid rgba(168,85,247,.3)", borderRadius:20, padding:"4px 10px", fontSize:11, fontWeight:700, color:"var(--green)" }}>✓ Conectado</span>
        ) : (
          <span style={{ background:"rgba(255,255,255,.04)", border:"1px solid var(--line)", borderRadius:20, padding:"4px 10px", fontSize:11, fontWeight:600, color:"var(--muted)" }}>{status}</span>
        )}
      </div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {onConnect && !connected && (
          <button onClick={onConnect} className="primary" style={{ fontSize:13, padding:"8px 16px" }}>
            Conectar
          </button>
        )}
        {onExport && (
          <button onClick={onExport} className="ghost" style={{ fontSize:13, padding:"8px 16px" }}>
            Exportar datos
          </button>
        )}
        {instructions && (
          <button onClick={() => setShowInstructions(s => !s)} className="ghost" style={{ fontSize:13, padding:"8px 16px" }}>
            {showInstructions ? "Ocultar pasos" : "Ver instrucciones"}
          </button>
        )}
      </div>
      {showInstructions && instructions && (
        <div style={{ marginTop:12, background:"var(--panel2)", borderRadius:12, padding:"12px 14px" }}>
          {instructions.map((step, i) => (
            <div key={i} style={{ display:"flex", gap:10, marginBottom:8, alignItems:"flex-start" }}>
              <span style={{ background:"rgba(168,85,247,.15)", color:"var(--green)", borderRadius:"50%", width:22, height:22, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, flexShrink:0 }}>{i+1}</span>
              <p style={{ margin:0, fontSize:13, color:"var(--muted)", lineHeight:1.5 }}>{step}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HealthSyncPage() {
  const setPage = useStore(s => s.setPage);
  const workouts = useStore(s => s.workouts) || [];
  const weightLog = useStore(s => s.weightLog) || [];
  const [exportMsg, setExportMsg] = useState("");

  function exportToCSV() {
    const rows = [["Fecha","Tipo","Ejercicio","Series","Peso(kg)","Reps","Volumen(kg)"]];
    workouts.forEach(w => {
      (w.sets || []).forEach(s => {
        if (!s.exercise) return;
        const vol = (Number(s.weight)||0) * (Number(s.reps)||0);
        rows.push([w.date, w.type||"", s.exercise, 1, s.weight||"", s.reps||"", vol]);
      });
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "pulse-workouts.csv"; a.click();
    URL.revokeObjectURL(url);

    const wRows = [["Fecha","Peso(kg)"]];
    weightLog.forEach(e => wRows.push([e.date, e.kg]));
    const wCsv = wRows.map(r => r.join(",")).join("\n");
    const wBlob = new Blob([wCsv], { type:"text/csv" });
    const wUrl = URL.createObjectURL(wBlob);
    const a2 = document.createElement("a"); a2.href = wUrl; a2.download = "pulse-peso.csv"; a2.click();
    URL.revokeObjectURL(wUrl);

    setExportMsg("✓ Archivos descargados");
    setTimeout(() => setExportMsg(""), 3000);
  }

  function openGoogleFit() {
    window.open("https://myaccount.google.com/data-and-privacy", "_blank");
  }

  return (
    <section className="page">
      <div className="page-head">
        <button className="back-btn" onClick={() => setPage("profile")} aria-label="Volver">
          <Icon name="ArrowLeft" size={20} strokeWidth={2.5} />
        </button>
        <div className="page-head-titles">
          <p className="eyebrow">Integración</p>
          <h1>Apps de salud</h1>
        </div>
      </div>

      <div style={{ background:"rgba(168,85,247,.06)", border:"1px solid rgba(168,85,247,.2)", borderRadius:14, padding:"12px 14px", marginBottom:16, fontSize:13, color:"var(--muted)", lineHeight:1.5 }}>
        <b style={{ color:"var(--green)" }}>¿Cómo funciona?</b> Podés exportar tus datos de Loop para importarlos manualmente en cualquier app de salud, o seguir los pasos de integración de cada plataforma.
      </div>

      <PlatformCard
        icon="🍎"
        name="Apple Health"
        desc="iPhone / iPad"
        status="Manual"
        instructions={[
          "Exportá tus datos desde Loop (botón abajo).",
          "Descargá la app gratuita 'Health Import' desde la App Store.",
          "Abrí Health Import → seleccioná el CSV de entrenamientos exportado.",
          "Los datos aparecerán automáticamente en Apple Health > Actividad.",
          "El peso corporal podés importarlo con el CSV de peso.",
        ]}
        onExport={exportToCSV}
      />

      <PlatformCard
        icon="🏃"
        name="Google Fit"
        desc="Android · Google"
        status="Manual"
        instructions={[
          "Exportá tus datos desde Loop (botón abajo).",
          "Andá a fit.google.com en tu computadora.",
          "Click en tu perfil → Gestionar datos → Importar.",
          "Subí el CSV de entrenamientos.",
          "Para el peso: Fit.google.com → Diario → Agregar → Peso → importá el CSV.",
        ]}
        onExport={exportToCSV}
        onConnect={openGoogleFit}
      />

      <PlatformCard
        icon="⌚"
        name="Samsung Health"
        desc="Galaxy Watch · Android Samsung"
        status="Via Google Fit"
        instructions={[
          "Samsung Health sincroniza automáticamente con Google Fit si tenés ambas apps instaladas.",
          "En Samsung Health → Configuración → Permisos → Google Fit → Activar sincronización.",
          "Una vez conectado, los datos de Google Fit (importados desde Loop) aparecen en Samsung Health.",
          "Alternativamente, exportá el CSV y usá 'Health Sync' (app de Play Store) para importar en Samsung Health.",
        ]}
        onExport={exportToCSV}
      />

      <PlatformCard
        icon="🔷"
        name="Mi Fitness (Xiaomi)"
        desc="Redmi · POCO · Xiaomi"
        status="Via Google Fit"
        instructions={[
          "Mi Fitness sincroniza con Google Fit en muchos dispositivos Xiaomi.",
          "Abrí Mi Fitness → Perfil → Aplicaciones de terceros → Google Fit → Conectar.",
          "Una vez vinculado, los datos importados a Google Fit desde Loop se reflejan en Mi Fitness.",
          "Para bandas Mi Band / Amazfit: usá la app Zepp y conectá con Google Fit de la misma forma.",
        ]}
        onExport={exportToCSV}
      />

      <PlatformCard
        icon="📊"
        name="Exportar datos (CSV)"
        desc="Compatible con cualquier app"
        status=""
        onExport={exportToCSV}
      />

      {exportMsg && (
        <div style={{ background:"rgba(168,85,247,.12)", border:"1px solid rgba(168,85,247,.3)", borderRadius:12, padding:"10px 14px", marginTop:8, fontSize:13, fontWeight:700, color:"var(--green)", textAlign:"center" }}>
          {exportMsg}
        </div>
      )}
    </section>
  );
}

