import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";
import useAuthStore from "../store/useAuthStore.js";
import useStore from "../store/useStore.js";
import Icon from "../components/Icon.jsx";

const MEDAL_COLORS = ['#f59e0b', '#94a3b8', '#b45309'];
function renderMedal(rank, size = 16) {
  return <Icon name="Trophy" size={size} style={{ color: MEDAL_COLORS[rank], display: 'inline-block', verticalAlign: 'middle' }} />;
}

function daysSince(dateStr) {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr + "T12:00:00").getTime()) / 86400000);
}

function activityDot(days) {
  if (days === null) return { color: "#374748", label: "Sin datos" };
  if (days <= 3)  return { color: "var(--green)",            label: "Activo" };
  if (days <= 6)  return { color: "#facc15",                 label: "En riesgo" };
  return           { color: "var(--danger, #e05)",            label: "Inactivo" };
}

export default function LeaguePage() {
  const { user, profile } = useAuthStore();
  const setPage = useStore((s) => s.setPage);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trainerName, setTrainerName] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setLoading(true);
      setError(null);

      // Fetch league via SECURITY DEFINER function
      const { data, error: rpcErr } = await supabase.rpc("get_my_league");
      if (rpcErr) {
        setError("No pudimos cargar la liga. Verificá tu conexión.");
        setLoading(false);
        return;
      }

      setStandings(data || []);

      // Get trainer name if profile has trainer_id
      if (profile?.trainer_id) {
        const { data: t } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", profile.trainer_id)
          .single();
        if (t?.name) setTrainerName(t.name.split(" ")[0]);
      }

      setLoading(false);
    })();
  }, [user?.id, profile?.trainer_id]);

  const myRank = standings.findIndex((s) => s.user_id === user?.id);
  const myEntry = standings[myRank];

  const noLeague = !loading && standings.length === 0;

  return (
    <div className="page-container" style={{ maxWidth: 480, margin: "0 auto", padding: "0 0 100px" }}>
      {/* Header */}
      <div style={{ padding: "16px 16px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <button className="ghost icon-btn" onClick={() => setPage("coach")}>
          <Icon name="ArrowLeft" size={20} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
            Liga{trainerName ? ` de ${trainerName}` : " del Gimnasio"}
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>
            Ranking semanal entre tus compañeros
          </p>
        </div>
      </div>

      <div style={{ padding: 16 }}>

        {loading && (
          <div style={{ textAlign: "center", padding: 60 }}>
            <Icon name="Loader" size={28} className="spin" />
          </div>
        )}

        {error && (
          <div className="card" style={{ textAlign: "center", padding: 32 }}>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>{error}</p>
          </div>
        )}

        {noLeague && (
          <div className="card" style={{ textAlign: "center", padding: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}><Icon name="Trophy" size={48} style={{display:'inline-block',verticalAlign:'middle'}} /></div>
            <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>Liga no disponible</h3>
            <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.5, margin: 0 }}>
              Tu entrenador todavía no tiene alumnos suficientes para armar la liga, o no estás vinculado a ningún entrenador.
            </p>
          </div>
        )}

        {standings.length > 0 && (
          <>
            {/* Mi posición highlight */}
            {myEntry && (
              <div style={{
                background: "linear-gradient(135deg, rgba(168,85,247,.16) 0%, rgba(124,58,237,.08) 100%)",
                border: "1px solid rgba(168,85,247,.3)",
                borderRadius: 14,
                padding: "14px 16px",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>
                  {myRank < 3 ? renderMedal(myRank, 24) : `#${myRank + 1}`}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Tu posición esta semana</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--muted)" }}>
                    {myEntry.workouts_this_week} entreno{myEntry.workouts_this_week !== 1 ? "s" : ""} esta semana ·{" "}
                    {myEntry.workouts_this_month} este mes
                  </p>
                </div>
              </div>
            )}

            {/* Podio top 3 */}
            {standings.length >= 3 && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 16, height: 110 }}>
                {[standings[1], standings[0], standings[2]].map((entry, i) => {
                  const realRank = i === 0 ? 1 : i === 1 ? 0 : 2;
                  const heights = [85, 110, 70];
                  const isMe = entry.user_id === user?.id;
                  return (
                    <div key={entry.user_id} style={{
                      flex: 1, height: heights[i],
                      background: isMe
                        ? "linear-gradient(135deg, rgba(168,85,247,.3), rgba(124,58,237,.2))"
                        : "var(--panel)",
                      border: isMe ? "1px solid rgba(168,85,247,.4)" : "1px solid var(--border)",
                      borderRadius: "12px 12px 0 0",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 4,
                      position: "relative",
                    }}>
                      <span style={{ fontSize: 20 }}>{renderMedal(realRank, 20)}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", textAlign: "center", padding: "0 4px", lineHeight: 1.2 }}>
                        {entry.display_name.split(" ")[0]}
                      </span>
                      <span style={{ fontSize: 10, color: "var(--muted)" }}>
                        {entry.workouts_this_week}x/sem
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Lista completa */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>Alumno</span>
                <div style={{ display: "flex", gap: 24 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>Sem</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>Mes</span>
                </div>
              </div>
              {standings.map((entry, idx) => {
                const isMe = entry.user_id === user?.id;
                const dot = activityDot(daysSince(entry.last_workout_date));
                return (
                  <div key={entry.user_id} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px",
                    borderBottom: idx < standings.length - 1 ? "1px solid var(--border)" : "none",
                    background: isMe ? "rgba(168,85,247,.06)" : "transparent",
                  }}>
                    {/* Rank */}
                    <div style={{
                      width: 24, flexShrink: 0, textAlign: "center",
                      fontSize: idx < 3 ? 16 : 12,
                      fontWeight: idx < 3 ? 700 : 500,
                      color: idx < 3 ? "var(--text)" : "var(--muted)",
                    }}>
                      {idx < 3 ? renderMedal(idx, 16) : `${idx + 1}`}
                    </div>

                    {/* Status dot */}
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: dot.color, flexShrink: 0,
                    }} title={dot.label} />

                    {/* Name */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        fontSize: 14, fontWeight: isMe ? 700 : 500,
                        color: isMe ? "var(--accent, #a855f7)" : "var(--text)",
                      }}>
                        {entry.display_name}{isMe ? " (vos)" : ""}
                      </span>
                    </div>

                    {/* Stats */}
                    <div style={{ display: "flex", gap: 24, flexShrink: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: entry.workouts_this_week > 0 ? "var(--green)" : "var(--muted)", minWidth: 20, textAlign: "right" }}>
                        {entry.workouts_this_week}
                      </span>
                      <span style={{ fontSize: 14, color: "var(--muted)", minWidth: 20, textAlign: "right" }}>
                        {entry.workouts_this_month}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 10 }}>
              Actualiza en tiempo real · Solo visible para alumnos del mismo entrenador
            </p>
          </>
        )}
      </div>
    </div>
  );
}
