import useStore from "../store/useStore.js";
import Icon from "../components/Icon.jsx";

export default function HealthSyncPage() {
  const setPage = useStore(s => s.setPage);

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

      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 24px", textAlign:"center", flex:1 }}>
        <div style={{ fontSize:64, marginBottom:20 }}>🔌</div>
        <h2 style={{ margin:"0 0 8px", fontSize:20, fontWeight:800 }}>Próximamente</h2>
        <p style={{ color:"var(--muted)", fontSize:14, lineHeight:1.6, margin:"0 0 4px", maxWidth:320 }}>
          Estamos trabajando en la integración nativa con Apple Health y Google Fit.
        </p>
        <p style={{ color:"var(--muted)", fontSize:13, lineHeight:1.5, margin:0, maxWidth:320 }}>
          Mientras tanto, podés exportar tus datos desde la pantalla de Perfil.
        </p>
      </div>
    </section>
  );
}

