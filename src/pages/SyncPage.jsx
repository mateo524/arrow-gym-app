import { useState, useRef } from "react";
import useStore from "../store/useStore.js";

export default function SyncPage() {
  const [token, setToken] = useState(() => localStorage.getItem("gh_sync_token") || "");
  const [status, setStatus] = useState("");
  const [status2, setStatus2] = useState("");
  const [lastSync, setLastSync] = useState(() => localStorage.getItem("gh_last_sync") || null);
  const workouts = useStore((state) => state.workouts);
  const bodyMetrics = useStore((state) => state.bodyMetrics);
  const customRoutines = useStore((state) => state.customRoutines);
  const customExercises = useStore((state) => state.customExercises);
  const importBackup = useStore((state) => state.importBackup);
  const fileRef = useRef(null);

  function saveToken(t) {
    setToken(t);
    localStorage.setItem("gh_sync_token", t);
  }

  async function syncToGist() {
    if (!token) { setStatus("Primero guardá un token de GitHub."); return; }
    setStatus("Subiendo a GitHub Gist...");
    const data = { workouts, bodyMetrics, customRoutines, customExercises, syncedAt: new Date().toISOString() };
    const content = JSON.stringify(data, null, 2);
    const filename = `arrow-gym-backup-${new Date().toISOString().slice(0, 10)}.json`;
    try {
      const existingRes = await fetch("https://api.github.com/gists", { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" } });
      if (!existingRes.ok) { setStatus("Error al conectar con GitHub. Verificá el token."); return; }
      const existingGists = await existingRes.json();
      const arrowGist = existingGists.find((g) => g.description?.startsWith("Arrow Gym"));
      let res;
      if (arrowGist) {
        res = await fetch(`https://api.github.com/gists/${arrowGist.id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/vnd.github.v3+json" },
          body: JSON.stringify({ files: { [filename]: { content } } }),
        });
      } else {
        res = await fetch("https://api.github.com/gists", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/vnd.github.v3+json" },
          body: JSON.stringify({ description: "Arrow Gym backup", public: false, files: { [filename]: { content } } }),
        });
      }
      if (!res.ok) { setStatus("Error al subir. Verificá el token."); return; }
      const gist = await res.json();
      localStorage.setItem("gh_last_sync", new Date().toISOString());
      setLastSync(new Date().toISOString());
      setStatus(`✅ Sincronizado. Gist: ${gist.html_url}`);
    } catch (e) {
      setStatus("Error de red: " + e.message);
    }
  }

  function downloadBackup() {
    const data = {
      workouts,
      bodyMetrics,
      customRoutines,
      customExercises,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arrow-gym-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus2("✅ Backup descargado");
    setTimeout(() => setStatus2(""), 3000);
  }

  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.workouts && !data.bodyMetrics) {
          setStatus2("❌ El archivo no tiene datos válidos de Arrow Gym");
          return;
        }
        if (!data.workouts && !data.bodyMetrics) {
          setStatus2("❌ El archivo no tiene datos válidos de Arrow Gym");
          return;
        }
        const confirmed = window.confirm(
          `¿Importar ${data.workouts?.length || 0} entrenamientos y ${data.bodyMetrics?.length || 0} mediciones? Los datos actuales se van a COMBINAR (no se borra nada).`
        );
        if (!confirmed) return;
        importBackup(data);
        setStatus2("✅ Datos importados correctamente");
        setTimeout(() => setStatus2(""), 3000);
      } catch {
        setStatus2("❌ Error al leer el archivo");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <section className="page">
      <p className="eyebrow">Sincronización</p>
      <h1>Sincronizar</h1>
      <div className="card" style={{ marginTop: 12 }}>
        <h2>iCloud</h2>
        <p>Si agregaste la app a la pantalla de inicio en iOS, iCloud sincroniza los datos automáticamente entre dispositivos Apple. No requiere configuración.</p>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <h2>GitHub Gist</h2>
        <p>Usá un token de GitHub (Settings → Developer settings → Personal access tokens → Fine-grained tokens, con permiso "gists: write").</p>
        <label style={{ display: "block", marginTop: 8 }}>
          <span style={{ color: "var(--muted)", fontSize: 12, display: "block", marginBottom: 4 }}>GitHub Token</span>
          <input type="password" value={token} onChange={(e) => saveToken(e.target.value)} placeholder="ghp_..." />
        </label>
        <div className="metric-actions" style={{ marginTop: 12 }}>
          <button className="primary" onClick={syncToGist} style={{ flex: 1 }}>Sincronizar ahora</button>
        </div>
        {status && <p style={{ marginTop: 8, fontSize: 13 }}>{status}</p>}
        {lastSync && <p style={{ marginTop: 4, fontSize: 11, color: "var(--muted)" }}>Última sincronización: {new Date(lastSync).toLocaleString("es")}</p>}
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <h2>Backup local (JSON)</h2>
        <p>Descargá tus datos como archivo JSON para guardarlos donde quieras. Si perdés los datos, podés importar el archivo de vuelta.</p>
        <div className="metric-actions" style={{ marginTop: 12 }}>
          <button className="primary" onClick={downloadBackup} style={{ flex: 1 }}>📥 Descargar backup</button>
        </div>
        <div className="metric-actions" style={{ marginTop: 8 }}>
          <button className="secondary" onClick={() => fileRef.current?.click()} style={{ flex: 1 }}>📤 Importar backup</button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
        </div>
        {status2 && <p style={{ marginTop: 8, fontSize: 13 }}>{status2}</p>}
      </div>
    </section>
  );
}
