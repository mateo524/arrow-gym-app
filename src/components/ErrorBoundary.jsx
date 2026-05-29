import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, textAlign: "center", color: "#f4fff8", background: "#050709", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <h1 style={{ fontSize: 28, marginBottom: 12 }}>Algo salió mal</h1>
          <p style={{ color: "#8ea0a0", marginBottom: 20, maxWidth: 320 }}>Ocurrió un error inesperado. Puede ser por datos corruptos en el almacenamiento local.</p>
          <button
            style={{ background: "#6df2a4", border: 0, borderRadius: 16, padding: "14px 24px", fontWeight: 800, fontSize: 15, color: "#03100a", cursor: "pointer" }}
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
          >
            Recargar app
          </button>
          <button
            style={{ background: "transparent", border: "1px solid #304548", borderRadius: 16, padding: "14px 24px", fontWeight: 800, fontSize: 15, color: "#eafff2", cursor: "pointer", marginTop: 8 }}
            onClick={() => { localStorage.clear(); window.location.reload(); }}
          >
            Limpiar datos locales y recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
