import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase.js";
import useAuthStore from "../store/useAuthStore.js";
import useStore from "../store/useStore.js";

export default function ChatPage() {
  const setPage = useStore(s => s.setPage);
  const { user, profile } = useAuthStore();

  const [conversations, setConversations] = useState([]); // [{ otherId, otherName, lastMessage, lastAt }]
  const [activeId, setActiveId] = useState(null); // the other person's user id
  const [activeName, setActiveName] = useState("");
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [sendingMsg, setSendingMsg] = useState(false);
  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);

  // ── Load conversation list ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  async function loadConversations() {
    setLoadingConvos(true);
    const myId = user.id;

    // Fetch all messages where I am sender or receiver
    const { data: msgs, error } = await supabase
      .from("messages")
      .select("id, from_id, to_id, body, created_at")
      .or(`from_id.eq.${myId},to_id.eq.${myId}`)
      .order("created_at", { ascending: false });

    if (error || !msgs) {
      setLoadingConvos(false);
      return;
    }

    // Deduplicate: one entry per other person, keep latest message
    const seen = new Map();
    for (const m of msgs) {
      const otherId = m.from_id === myId ? m.to_id : m.from_id;
      if (!seen.has(otherId)) {
        seen.set(otherId, { otherId, lastMessage: m.body, lastAt: m.created_at });
      }
    }

    if (seen.size === 0) {
      setConversations([]);
      setLoadingConvos(false);
      return;
    }

    // Fetch profiles for the other people
    const otherIds = [...seen.keys()];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, name")
      .in("id", otherIds);

    const convos = otherIds.map((id) => {
      const p = profiles?.find((pr) => pr.id === id);
      const displayName = p?.full_name || p?.name || "Usuario";
      return { ...seen.get(id), otherName: displayName };
    });

    // Sort by most recent
    convos.sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));
    setConversations(convos);
    setLoadingConvos(false);
  }

  // ── Open a conversation ─────────────────────────────────────────────────────
  async function openConversation(otherId, otherName) {
    setActiveId(otherId);
    setActiveName(otherName);
    setMessages([]);
    await fetchMessages(otherId);
    subscribeToMessages(otherId);
    markMessagesRead(otherId);
  }

  async function fetchMessages(otherId) {
    const myId = user.id;
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(from_id.eq.${myId},to_id.eq.${otherId}),and(from_id.eq.${otherId},to_id.eq.${myId})`
      )
      .order("created_at", { ascending: true });

    if (!error && data) setMessages(data);
  }

  function subscribeToMessages(otherId) {
    // Unsubscribe previous channel if any
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const myId = user.id;
    const channel = supabase
      .channel(`chat:${[myId, otherId].sort().join("_")}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg = payload.new;
          const isRelevant =
            (msg.from_id === myId && msg.to_id === otherId) ||
            (msg.from_id === otherId && msg.to_id === myId);
          if (isRelevant) {
            setMessages((prev) => {
              if (prev.find((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
            if (msg.from_id === otherId) {
              markMessagesRead(otherId);
            }
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
  }

  async function markMessagesRead(otherId) {
    const myId = user.id;
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("from_id", otherId)
      .eq("to_id", myId)
      .eq("read", false);
  }

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send a message ──────────────────────────────────────────────────────────
  async function sendMessage(e) {
    e.preventDefault();
    const text = body.trim();
    if (!text || !activeId || sendingMsg) return;

    setSendingMsg(true);
    const { error } = await supabase.from("messages").insert({
      from_id: user.id,
      to_id: activeId,
      body: text,
      read: false,
    });
    if (!error) {
      setBody("");
      // Refresh conversation list to update last message
      loadConversations();
    }
    setSendingMsg(false);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function formatTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  }

  function formatDate(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
    });
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => setPage("home")} style={styles.backBtn}>
          ← Volver
        </button>
        <h1 style={styles.headerTitle}>
          {activeId ? activeName : "Mensajes"}
        </h1>
        {activeId && (
          <button
            onClick={() => {
              setActiveId(null);
              setActiveName("");
              setMessages([]);
              if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
              }
            }}
            style={styles.closeConvoBtn}
          >
            ✕
          </button>
        )}
      </div>

      <div style={styles.body}>
        {/* Conversation list — shown on left (desktop) or top (mobile) */}
        <div
          style={{
            ...styles.sidebar,
            display: activeId ? "none" : "flex",
          }}
          className="chat-sidebar"
        >
          {loadingConvos ? (
            <p style={styles.emptyText}>Cargando...</p>
          ) : conversations.length === 0 ? (
            <p style={styles.emptyText}>No tenés mensajes aún</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.otherId}
                style={{
                  ...styles.convoItem,
                  background: activeId === c.otherId ? "#2d2d2d" : "transparent",
                }}
                onClick={() => openConversation(c.otherId, c.otherName)}
              >
                <div style={styles.avatar}>
                  {c.otherName.charAt(0).toUpperCase()}
                </div>
                <div style={styles.convoInfo}>
                  <span style={styles.convoName}>{c.otherName}</span>
                  <span style={styles.convoPreview}>
                    {c.lastMessage?.length > 40
                      ? c.lastMessage.slice(0, 40) + "…"
                      : c.lastMessage}
                  </span>
                </div>
                <span style={styles.convoTime}>{formatDate(c.lastAt)}</span>
              </button>
            ))
          )}
        </div>

        {/* Chat area */}
        {activeId ? (
          <div style={styles.chatArea}>
            {/* Messages */}
            <div style={styles.messagesList}>
              {messages.length === 0 && (
                <p style={styles.emptyText}>Empezá la conversación</p>
              )}
              {messages.map((msg) => {
                const mine = msg.from_id === user.id;
                return (
                  <div
                    key={msg.id}
                    style={{
                      ...styles.bubbleRow,
                      justifyContent: mine ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        ...styles.bubble,
                        background: mine ? "#e63946" : "#2d2d2d",
                        borderBottomRightRadius: mine ? 4 : 16,
                        borderBottomLeftRadius: mine ? 16 : 4,
                      }}
                    >
                      <span style={styles.bubbleText}>{msg.body}</span>
                      <span style={styles.bubbleTime}>
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} style={styles.inputRow}>
              <input
                style={styles.input}
                type="text"
                placeholder="Escribí un mensaje..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                style={{
                  ...styles.sendBtn,
                  opacity: body.trim() && !sendingMsg ? 1 : 0.5,
                }}
                disabled={!body.trim() || sendingMsg}
              >
                Enviar
              </button>
            </form>
          </div>
        ) : (
          <div style={styles.noConvoPlaceholder}>
            {conversations.length > 0 && (
              <p style={styles.emptyText}>
                Seleccioná una conversación
              </p>
            )}
          </div>
        )}
      </div>

      {/* Responsive: show sidebar again when on mobile and no active chat */}
      <style>{`
        @media (min-width: 640px) {
          .chat-sidebar {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    height: "100dvh",
    background: "#111",
    color: "#fff",
    fontFamily: "system-ui, sans-serif",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    borderBottom: "1px solid #2a2a2a",
    background: "#1a1a1a",
    flexShrink: 0,
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#e63946",
    fontSize: 15,
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: 6,
    flexShrink: 0,
  },
  headerTitle: {
    flex: 1,
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  closeConvoBtn: {
    background: "none",
    border: "none",
    color: "#888",
    fontSize: 18,
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: 6,
    flexShrink: 0,
  },
  body: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },
  sidebar: {
    width: "100%",
    maxWidth: 340,
    borderRight: "1px solid #2a2a2a",
    flexDirection: "column",
    overflowY: "auto",
    background: "#161616",
    flexShrink: 0,
  },
  emptyText: {
    color: "#666",
    textAlign: "center",
    padding: "32px 16px",
    fontSize: 14,
    margin: 0,
  },
  convoItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    border: "none",
    borderBottom: "1px solid #222",
    cursor: "pointer",
    color: "#fff",
    width: "100%",
    textAlign: "left",
    transition: "background 0.15s",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#e63946",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 16,
    flexShrink: 0,
  },
  convoInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 0,
  },
  convoName: {
    fontWeight: 600,
    fontSize: 14,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  convoPreview: {
    fontSize: 12,
    color: "#888",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  convoTime: {
    fontSize: 11,
    color: "#555",
    flexShrink: 0,
  },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  messagesList: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  bubbleRow: {
    display: "flex",
    width: "100%",
  },
  bubble: {
    maxWidth: "72%",
    padding: "10px 14px",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 1.4,
    wordBreak: "break-word",
  },
  bubbleTime: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    alignSelf: "flex-end",
  },
  inputRow: {
    display: "flex",
    gap: 8,
    padding: "12px 12px",
    borderTop: "1px solid #2a2a2a",
    background: "#1a1a1a",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: "#2a2a2a",
    border: "none",
    borderRadius: 20,
    padding: "10px 16px",
    color: "#fff",
    fontSize: 14,
    outline: "none",
  },
  sendBtn: {
    background: "#e63946",
    color: "#fff",
    border: "none",
    borderRadius: 20,
    padding: "10px 20px",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    flexShrink: 0,
    transition: "opacity 0.15s",
  },
  noConvoPlaceholder: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
