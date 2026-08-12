import { useState } from "react";
import useStore from "../store/useStore.js";
import Icon from "./Icon.jsx";

const TYPE_META = {
  trainer_request: { color:"#22c55e",  bg:"rgba(34,197,94,.08)",  border:"rgba(34,197,94,.2)",  icon:"UserCheck",      label:"Solicitud de entrenador" },
  new_routine:     { color:"#60a5fa",  bg:"rgba(96,165,250,.08)", border:"rgba(96,165,250,.2)", icon:"Dumbbell",       label:"Nueva rutina"            },
  routine_change:  { color:"#f59e0b",  bg:"rgba(245,158,11,.08)", border:"rgba(245,158,11,.2)", icon:"RefreshCw",      label:"Rutina modificada"       },
  comment:         { color:"#a855f7",  bg:"rgba(168,85,247,.08)", border:"rgba(168,85,247,.2)", icon:"MessageCircle",  label:"Nuevo comentario"        },
  generic:         { color:"var(--muted)", bg:"var(--panel2)",    border:"var(--line)",         icon:"Bell",           label:"Notificación"            },
};

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)   return "ahora";
  if (diff < 3600) return `hace ${Math.floor(diff/60)}min`;
  if (diff < 86400)return `hace ${Math.floor(diff/3600)}h`;
  return `hace ${Math.floor(diff/86400)}d`;
}

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const notifications   = useStore(s => s.notifications) || [];
  const markRead        = useStore(s => s.markNotificationRead);
  const markAllRead     = useStore(s => s.markAllRead);
  const dismiss         = useStore(s => s.dismissNotification);
  const unreadCount     = notifications.filter(n => !n.read).length;

  function handleOpen() {
    setOpen(true);
  }

  function handleAction(notif, action) {
    // Fire the action callback if provided
    if (action === "accept" && notif.onAccept) notif.onAccept();
    if (action === "reject" && notif.onReject) notif.onReject();
    // Dismiss regardless
    dismiss(notif.id);
  }

  return (
    <>
      {/* Bell button — inline, caller positions it */}
      <button
        onClick={handleOpen}
        style={{ background:"none", border:"none", cursor:"pointer", padding:4, position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}
        aria-label="Notificaciones"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position:"absolute", top:0, right:0,
            width:16, height:16, borderRadius:"50%",
            background:"#ef4444", color:"#fff",
            fontSize:9, fontWeight:900,
            display:"flex", alignItems:"center", justifyContent:"center",
            border:"2px solid var(--bg)",
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Overlay panel */}
      {open && (
        <div
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.65)", zIndex:500, display:"flex", flexDirection:"column", justifyContent:"flex-start" }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div style={{ background:"var(--bg)", borderRadius:"0 0 20px 20px", maxHeight:"85vh", display:"flex", flexDirection:"column" }}>
            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 18px 12px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <h3 style={{ margin:0, fontSize:17, fontWeight:900 }}>Notificaciones</h3>
                {unreadCount > 0 && (
                  <span style={{ background:"#ef4444", color:"#fff", fontSize:10, fontWeight:800, padding:"2px 7px", borderRadius:20 }}>{unreadCount} nueva{unreadCount > 1 ? "s" : ""}</span>
                )}
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ background:"none", border:"none", fontSize:12, color:"var(--green)", fontWeight:600, cursor:"pointer" }}>Marcar todo leído</button>
                )}
                <button onClick={() => setOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, color:"var(--muted)" }}>×</button>
              </div>
            </div>

            {/* Notification list */}
            <div style={{ overflowY:"auto", flex:1, padding:"0 14px 32px" }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 20px", color:"var(--muted)" }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display:"block", margin:"0 auto 12px" }}>
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                  <p style={{ margin:0, fontSize:14 }}>Sin notificaciones</p>
                </div>
              ) : (
                notifications.map(notif => {
                  const meta = TYPE_META[notif.type] || TYPE_META.generic;
                  const hasActions = notif.type === "trainer_request" || notif.type === "new_routine" || notif.type === "routine_change";
                  const needsAcceptReject = notif.type === "trainer_request";

                  return (
                    <div
                      key={notif.id}
                      onClick={() => markRead(notif.id)}
                      style={{
                        background: notif.read ? "var(--panel)" : meta.bg,
                        border: `1px solid ${notif.read ? "var(--line)" : meta.border}`,
                        borderRadius:16, padding:"12px 14px", marginBottom:10,
                        opacity: notif.read ? 0.75 : 1,
                        cursor:"default",
                      }}
                    >
                      <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:10, background:`${meta.color}22`, border:`1px solid ${meta.color}44`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2 }}>
                          <Icon name={meta.icon} size={15} style={{ color:meta.color }} />
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, marginBottom:3 }}>
                            <span style={{ fontSize:12, fontWeight:800, color:meta.color }}>{meta.label}</span>
                            <span style={{ fontSize:10, color:"var(--muted)", flexShrink:0 }}>{timeAgo(notif.createdAt)}</span>
                          </div>
                          <p style={{ margin:"0 0 6px", fontSize:13, fontWeight:600, color:"var(--text)", lineHeight:1.4 }}>{notif.title}</p>
                          {notif.body && <p style={{ margin:"0 0 8px", fontSize:12, color:"var(--muted)", lineHeight:1.4 }}>{notif.body}</p>}

                          {/* Action buttons */}
                          {hasActions && !notif.read && (
                            <div style={{ display:"flex", gap:8, marginTop:4 }}>
                              {needsAcceptReject ? (
                                <>
                                  <button
                                    onClick={e => { e.stopPropagation(); handleAction(notif, "accept"); }}
                                    style={{ flex:1, background:"rgba(34,197,94,.15)", border:"1px solid rgba(34,197,94,.35)", borderRadius:10, padding:"7px 10px", fontSize:12, fontWeight:700, color:"var(--green)", cursor:"pointer" }}>
                                    <Icon name="Check" size={12} style={{display:"inline-block",verticalAlign:"middle",marginRight:3}} /> Aceptar
                                  </button>
                                  <button
                                    onClick={e => { e.stopPropagation(); handleAction(notif, "reject"); }}
                                    style={{ flex:1, background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)", borderRadius:10, padding:"7px 10px", fontSize:12, fontWeight:700, color:"#ef4444", cursor:"pointer" }}>
                                    <Icon name="X" size={12} style={{display:"inline-block",verticalAlign:"middle",marginRight:3}} /> Rechazar
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={e => { e.stopPropagation(); handleAction(notif, "accept"); }}
                                  style={{ background:"rgba(34,197,94,.12)", border:"1px solid rgba(34,197,94,.3)", borderRadius:10, padding:"7px 14px", fontSize:12, fontWeight:700, color:"var(--green)", cursor:"pointer" }}>
                                  <Icon name="Check" size={12} style={{display:"inline-block",verticalAlign:"middle",marginRight:3}} /> Visto
                                </button>
                              )}
                              <button
                                onClick={e => { e.stopPropagation(); dismiss(notif.id); }}
                                style={{ background:"none", border:"1px solid var(--line)", borderRadius:10, padding:"7px 10px", fontSize:12, color:"var(--muted)", cursor:"pointer" }}>
                                <Icon name="X" size={12} style={{display:"inline-block",verticalAlign:"middle"}} />
                              </button>
                            </div>
                          )}

                          {/* Dismiss button for non-actionable */}
                          {!hasActions && (
                            <button
                              onClick={e => { e.stopPropagation(); dismiss(notif.id); }}
                              style={{ background:"none", border:"none", padding:0, fontSize:11, color:"var(--muted)", cursor:"pointer" }}>
                              Descartar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
