import { useEffect } from "react";
import useStore from "../store/useStore.js";

export default function SyncChip() {
  const syncStatus = useStore(s => s.syncStatus);
  const setSyncStatus = useStore(s => s.setSyncStatus);

  useEffect(() => {
    if (syncStatus === "saved") {
      const t = setTimeout(() => setSyncStatus("idle"), 3000);
      return () => clearTimeout(t);
    }
  }, [syncStatus, setSyncStatus]);

  if (syncStatus === "idle") return null;

  const styles = {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: 20,
    ...(syncStatus === "saving" && { background: "rgba(255,255,255,.1)", color: "var(--muted)" }),
    ...(syncStatus === "saved"  && { background: "rgba(34,211,120,.15)", color: "var(--green)" }),
    ...(syncStatus === "error"  && { background: "rgba(251,191,36,.15)", color: "#fbbf24" }),
  };

  return (
    <span style={styles}>
      {syncStatus === "saving" && (
        <>
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", border: "2px solid currentColor", borderTopColor: "transparent", animation: "spin .7s linear infinite" }} />
          Guardando
        </>
      )}
      {syncStatus === "saved" && <>&#10003; Guardado</>}
      {syncStatus === "error"  && <>⚠ Sin conexión</>}
    </span>
  );
}
