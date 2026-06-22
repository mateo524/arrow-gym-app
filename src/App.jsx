import { useEffect, useRef, useState, Component, lazy, Suspense } from "react";
import { Router, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
// Critical path: load HomePage and WorkoutPage eagerly, everything else lazy
import HomePage from "./pages/HomePage.jsx";
import WorkoutPage from "./pages/WorkoutPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
const StartWorkoutPage   = lazy(() => import("./pages/StartWorkoutPage.jsx"));
const ExercisesPage      = lazy(() => import("./pages/ExercisesPage.jsx"));
const HistoryPage        = lazy(() => import("./pages/HistoryPage.jsx"));
const WorkoutDetailPage  = lazy(() => import("./pages/WorkoutDetailPage.jsx"));
const CoachPage          = lazy(() => import("./pages/CoachPage.jsx"));
const AdminPage          = lazy(() => import("./pages/AdminPage.jsx"));
const TrainerPage        = lazy(() => import("./pages/TrainerPage.jsx"));
const ProfilePage        = lazy(() => import("./pages/ProfilePage.jsx"));
const PRPage             = lazy(() => import("./pages/PRPage.jsx"));
const MeasurementsPage   = lazy(() => import("./pages/MeasurementsPage.jsx"));
const CardioPage         = lazy(() => import("./pages/CardioPage.jsx"));
const RoutinesPage       = lazy(() => import("./pages/RoutinesPage.jsx"));
const CalendarPage       = lazy(() => import("./pages/CalendarPage.jsx"));
const BadgesPage         = lazy(() => import("./pages/BadgesPage.jsx"));
const ChatPage           = lazy(() => import("./pages/ChatPage.jsx"));
const HealthSyncPage     = lazy(() => import("./pages/HealthSyncPage.jsx"));
const ChallengesPage     = lazy(() => import("./pages/ChallengesPage.jsx"));
import Nav from "./components/Nav.jsx";
import OnboardingModal from "./components/OnboardingModal.jsx";
import useStore from "./store/useStore.js";
import useAuthStore from "./store/useAuthStore.js";
import { supabase } from "./lib/supabase.js";

const APP_VERSION = "46";
const NOVEDADES = [
  { icon: "⏱", text: "Timer de descanso funciona aunque cambies de pestaña." },
  { icon: "🏆", text: "Resumen de records al terminar un entrenamiento." },
  { icon: "▶️", text: "Timer de descanso manual — apretas 'Iniciar descanso' cuando estes listo." },
  { icon: "🎯", text: "Al crear rutina, elegi entre hacerla vos o que el coach te ayude." },
  { icon: "📊", text: "Progresion redisenada — records primero, stats opcionales." },
  { icon: "🔌", text: "Health Sync reemplazada por 'Proximamente'." },
  { icon: "🛡️", text: "Manejo de errores mejorado en toda la app." },
  { icon: "🥗", text: "Plan de comidas: hoy destacado, auto-expansion, log rapido por comida." },
  { icon: "🔴", text: "Punto rojo en Coach solo cuando terminas un entreno con reportes." },
  { icon: "🗣️", text: "Coach por voz removido — limpieza general de emojis." },
];

function InstallBanner({ onInstall, onDismiss, isIOS }) {
  if (isIOS) {
    return (
      <div style={{ position:"fixed", bottom:80, left:12, right:12, zIndex:9997, background:"var(--panel)", border:"1px solid var(--border)", borderRadius:16, padding:"14px 16px", boxShadow:"0 4px 24px rgba(0,0,0,.5)" }}>
        <button onClick={onDismiss} style={{ position:"absolute", top:10, right:12, background:"none", border:"none", color:"var(--muted)", fontSize:18, cursor:"pointer" }}>✕</button>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
          <img src="/icon-192.png" width={40} height={40} style={{ borderRadius:10 }} alt="Loop" />
          <div>
            <div style={{ fontWeight:800, fontSize:14 }}>Instalá Loop</div>
            <div style={{ fontSize:12, color:"var(--muted)" }}>Accedé desde tu pantalla de inicio</div>
          </div>
        </div>
        <div style={{ fontSize:13, color:"var(--muted)", lineHeight:1.6 }}>
          Tocá <b style={{ color:"var(--text)" }}>􀈂 Compartir</b> y después <b style={{ color:"var(--text)" }}>"Añadir a inicio"</b>
        </div>
      </div>
    );
  }
  return (
    <div style={{ position:"fixed", bottom:80, left:12, right:12, zIndex:9997, background:"var(--panel)", border:"1px solid var(--green)", borderRadius:16, padding:"14px 16px", boxShadow:"0 4px 24px rgba(0,0,0,.5)", display:"flex", alignItems:"center", gap:12 }}>
      <img src="/icon-192.png" width={40} height={40} style={{ borderRadius:10, flexShrink:0 }} alt="Loop" />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:800, fontSize:14 }}>Instalá Loop</div>
        <div style={{ fontSize:12, color:"var(--muted)" }}>Agregala a tu pantalla de inicio</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:6, flexShrink:0 }}>
        <button className="primary" style={{ padding:"8px 14px", fontSize:13 }} onClick={onInstall}>Instalar</button>
        <button onClick={onDismiss} style={{ background:"none", border:"none", color:"var(--muted)", fontSize:12, cursor:"pointer", textAlign:"center" }}>Ahora no</button>
      </div>
    </div>
  );
}

function NovedadesModal({ onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:10000, background:"rgba(0,0,0,.65)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}
      onClick={onClose}>
      <div style={{ background:"var(--panel)", borderRadius:"20px 20px 0 0", padding:"24px 20px 32px", width:"100%", maxWidth:480, boxShadow:"0 -4px 32px rgba(0,0,0,.4)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <span style={{ fontWeight:700, fontSize:18 }}>🚀 Novedades</span>
          <button style={{ background:"none", border:"none", color:"var(--muted)", fontSize:22, lineHeight:1, cursor:"pointer", padding:"0 4px" }} onClick={onClose}>✕</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
          {NOVEDADES.map((n, i) => (
            <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
              <span style={{ fontSize:22, lineHeight:"1.4" }}>{n.icon}</span>
              <span style={{ fontSize:14, color:"var(--text)", lineHeight:"1.5" }}>{n.text}</span>
            </div>
          ))}
        </div>
        <button className="primary" style={{ width:"100%" }} onClick={onClose}>¡Entendido!</button>
      </div>
    </div>
  );
}

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("[ErrorBoundary]", error, info); }
  componentDidUpdate(prevProps) {
    // Reset error when page changes so the next page renders cleanly
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, minHeight: "100vh", background: "var(--bg, #fff)" }}>
          <h2 style={{ marginTop: 0, color: "var(--text, #e2e8f0)" }}>Algo salió mal</h2>
          <p style={{ color: "var(--muted)", fontSize: 13, fontFamily: "monospace", wordBreak: "break-word" }}>
            {this.state.error.message}
          </p>
          <button className="primary" onClick={() => this.setState({ error: null })}>Reintentar</button>
        </div>
      );
    }
    return this.props.children;
  }
}


const PAGE_MAP = {
  home: HomePage,
  start: StartWorkoutPage,
  workout: WorkoutPage,
  exercises: ExercisesPage,
  history: HistoryPage,
  workoutDetail: WorkoutDetailPage,
  coach: CoachPage,
  admin: AdminPage,
  trainer: TrainerPage,
  profile: ProfilePage,
  prs: PRPage,
  measurements: MeasurementsPage,
  cardio: CardioPage,
  routines: RoutinesPage,
  calendar: CalendarPage,
  badges: BadgesPage,
  chat: ChatPage,
  healthsync: HealthSyncPage,
  challenges: ChallengesPage,
};

function AppContent() {
  const [location, setLocation] = useLocation();
  const currentPage = useStore((s) => s.currentPage);
  const activeWorkout = useStore((s) => s.activeWorkout);
  const amoled = useStore((s) => s.amoled);
  const setPage = useStore((s) => s.setPage);
  const lastSeenVersion = useStore((s) => s.lastSeenVersion);
  const markVersionSeen = useStore((s) => s.markVersionSeen);
  const [showNovedades, setShowNovedades] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);   // Android: deferred prompt
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [swUpdateReady, setSwUpdateReady] = useState(false);

  const { user, profile, loading, init } = useAuthStore();
  // These three hooks MUST live before any early return to satisfy React Rules of Hooks
  const hasSeenOnboarding = useStore(s => s.hasSeenOnboarding);
  const markOnboardingSeen = useStore(s => s.markOnboardingSeen);
  const workouts = useStore(s => s.workouts) || [];
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const isReturningUser = workouts.length > 0 || Boolean(profile?.goal) || Boolean(profile?.fitness_level) || Boolean(profile?.weight_kg);

  // Show "Novedades" popup when a new version is deployed
  useEffect(() => {
    if (user && lastSeenVersion !== APP_VERSION) {
      // Small delay so the app shell renders first
      const t = setTimeout(() => setShowNovedades(true), 800);
      return () => clearTimeout(t);
    }
  }, [user, lastSeenVersion]);

  // PWA install prompt — Android: capture beforeinstallprompt; iOS: detect Safari
  useEffect(() => {
    // Don't show if already installed as standalone
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (window.navigator.standalone === true) return; // iOS standalone

    // iOS detection — they don't have beforeinstallprompt, need manual instructions
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    if (ios) {
      // Show iOS instructions after 10s, only once per session
      const shown = sessionStorage.getItem('install-shown');
      if (!shown) {
        setTimeout(() => { setIsIOS(true); setShowInstallBanner(true); }, 10000);
        sessionStorage.setItem('install-shown', '1');
      }
      return;
    }

    // Android / Chrome: listen for the deferred prompt
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      const shown = sessionStorage.getItem('install-shown');
      if (!shown) {
        setTimeout(() => setShowInstallBanner(true), 3000);
        sessionStorage.setItem('install-shown', '1');
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Fires when a new SW takes control of this page (clientsClaim: true).
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      setSwUpdateReady(true);
    });
  }, []);

  // Flush offline queue when connectivity is restored
  useEffect(() => {
    const handleOnline = () => {
      import("./lib/workoutSync.js").then(({ syncWorkoutUp }) => {
        import("./lib/offlineQueue.js").then(({ flush }) => {
          flush(async (item) => {
            if (item.type === "upsert_workout") {
              await syncWorkoutUp(item.row, item.row.user_id);
            }
          });
        }).catch(() => {});
      }).catch(() => {});
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  // Show password change modal when redirected from forgot-password email
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setShowPasswordModal(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Init auth in background — the cached session already set user synchronously
  useEffect(() => {
    init();
    // Safety net: if loading OR profile-fetch hangs for 8s, unblock the UI
    const t = setTimeout(() => {
      const s = useAuthStore.getState();
      if (s.loading) useAuthStore.setState({ loading: false });
      if (s.user && !s.profile) {
        // Unblock with a minimal profile so the user isn't stuck on splash
        useAuthStore.setState({ profile: { id: s.user.id, email: s.user.email, role: "user" } });
      }
    }, 8000);
    return () => clearTimeout(t);
  }, []);

  // Push notification: ask permission once, then fire if user hasn't trained in 3+ days
  useEffect(() => {
    if (!("Notification" in window)) return;
    const workouts = useStore.getState().workouts || [];
    const restDays = useStore.getState().restDays || [];
    const allDays = [
      ...workouts.map(w => w.date),
      ...restDays.map(r => r.date),
    ].sort().reverse();
    const lastActive = allDays[0];
    if (!lastActive) return;
    const daysSince = Math.floor((Date.now() - new Date(lastActive).getTime()) / 86400000);
    if (daysSince < 3) return;
    const notify = () => {
      const msgs = [
        `Llevas ${daysSince} días sin entrenar. ¡El gym te extraña! 💪`,
        `${daysSince} días de descanso... ¿será que ya descansaste suficiente? 🔥`,
        `Tu racha está en pausa hace ${daysSince} días. ¡Volvé hoy! ⚡`,
      ];
      new Notification("Arrow Gym", {
        body: msgs[daysSince % msgs.length],
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "inactivity",
      });
    };
    if (Notification.permission === "granted") {
      notify();
    } else if (Notification.permission === "default") {
      Notification.requestPermission().then(p => { if (p === "granted") notify(); }).catch(() => {});
    }
  }, []);

  // Backup active workout to sessionStorage every time it changes.
  // sessionStorage survives iOS PWA app switches (unlike in-memory state).
  useEffect(() => {
    if (activeWorkout) {
      sessionStorage.setItem("arrow-gym-active-workout", JSON.stringify(activeWorkout));
    } else {
      sessionStorage.removeItem("arrow-gym-active-workout");
    }
  }, [activeWorkout]);

  const [draftRecovered, setDraftRecovered] = useState(false);

  // On mount: if Zustand lost the active workout (iOS killed the process) but
  // sessionStorage still has it, restore it immediately before any render.
  useEffect(() => {
    const stored = sessionStorage.getItem("arrow-gym-active-workout");
    if (stored && !activeWorkout) {
      try {
        const recovered = JSON.parse(stored);
        useStore.setState({ activeWorkout: recovered, currentPage: "workout" });
        setDraftRecovered(true);
      } catch {}
    }
  }, []);

  // On mount only: read URL once and set initial page from it
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    const path = location.replace(/^\//, "") || "home";
    if (PAGE_MAP[path] && path !== currentPage) setPage(path);
  }, []); // eslint-disable-line

  // Active workout always wins — redirect to workout page
  useEffect(() => {
    if (activeWorkout && currentPage !== "workout") setPage("workout");
  }, [activeWorkout]);

  // Store → URL (one-way, no feedback loop)
  useEffect(() => {
    const path = "/" + currentPage;
    if (path !== location) setLocation(path, { replace: true });
  }, [currentPage]);

  // These effects reference user/profile so they must also be before any early return
  useEffect(() => { if (isReturningUser && !hasSeenOnboarding) markOnboardingSeen(); }, [isReturningUser, hasSeenOnboarding]);
  useEffect(() => {
    if (!user || !("Notification" in window)) return;
    if (Notification.permission !== "default") return;
    Notification.requestPermission().then(perm => {
      if (perm !== "granted") return;
      const last = workouts[0];
      if (!last) return;
      const daysSince = Math.floor((Date.now() - new Date(last.date + "T12:00:00").getTime()) / 86400000);
      if (daysSince >= 2) {
        new Notification("💪 Loop — Hora de entrenar", {
          body: `Llevas ${daysSince} días sin entrenar. ¿Hoy va?`,
          icon: "/icon.svg",
          tag: "training-reminder",
        });
      }
    }).catch(() => {});
  }, [user]);

  // Show a minimal splash ONLY when there's no cached session at all
  // (first load, logged out). If there's a cached user we skip the splash
  // entirely so returning to the app feels instant.
  // Show splash while: (a) initial load with no cached session, or (b) session
  // refreshed but profile hasn't loaded yet — prevents the black screen on iOS PWA
  // when the app is opened after the JWT has expired.
  if (loading || (user && !profile)) {
    return (
      <div className="splash-screen">
        <div className="splash-logo">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M8 24L24 8L40 24L24 40L8 24Z" stroke="var(--green)" strokeWidth="2.5" fill="none" />
            <path d="M24 14L34 24L24 34L14 24L24 14Z" fill="var(--green)" opacity=".3" />
          </svg>
          <span>Loop</span>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  // Access control: block only if subscription is explicitly inactive/cancelled.
  // Users with no subscription_status (existing users) get free access.
  const subStatus = profile?.subscription_status;
  const hasAccess = !subStatus || subStatus === "active" || subStatus === "trialing";
  if (!hasAccess) {
    return (
      <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:16 }}>🔒</div>
        <h2 style={{ margin:"0 0 8px" }}>Suscripción vencida</h2>
        <p style={{ color:"var(--muted)", fontSize:14, marginBottom:24 }}>Renová tu plan para seguir entrenando con la app.</p>
        <button className="primary" style={{ marginBottom:12 }} onClick={() => window.open("https://mpago.la/placeholder", "_blank")}>
          Renovar plan
        </button>
        <button className="ghost" onClick={() => useAuthStore.getState().logout()}>Cerrar sesión</button>
      </div>
    );
  }

  const role = profile?.role;
  const isAdminRole = ["superadmin", "admin", "trainer"].includes(role);
  const accountAgeMs = profile?.created_at ? Date.now() - new Date(profile.created_at).getTime() : 0;
  const trialExpired = !isAdminRole && accountAgeMs > 30 * 24 * 60 * 60 * 1000 && subStatus !== "active";

  if (trialExpired) {
    return (
      <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>⏳</div>
        <h2 style={{ margin:"0 0 8px" }}>Hola {profile?.name || profile?.email?.split("@")[0] || ""},</h2>
        <p style={{ color:"var(--muted)", fontSize:15, marginBottom:8 }}>Tu período de prueba terminó.</p>
        <p style={{ color:"var(--muted)", fontSize:14, marginBottom:24, lineHeight:1.6 }}>
          Para seguir usando la app, suscribite por <b style={{ color:"var(--text)" }}>$25.000 ARS/mes</b>.
        </p>
        <button className="primary" style={{ marginBottom:12, padding:"14px 28px", fontSize:15 }}
          onClick={() => window.open("https://mpago.la/placeholder", "_blank")}>
          Suscribirme ahora
        </button>
        <button className="ghost" style={{ color:"var(--muted)", fontSize:13 }} onClick={() => useAuthStore.getState().logout()}>
          Cerrar sesión
        </button>
      </div>
    );
  }

  const PAGE_ROLE_GUARDS = {
    admin: ["admin", "superadmin"],
    trainer: ["trainer", "admin", "superadmin"],
  };
  const requiredRoles = PAGE_ROLE_GUARDS[currentPage];
  const isAllowed = !requiredRoles || requiredRoles.includes(role);
  const PageComponent = isAllowed ? (PAGE_MAP[currentPage] || HomePage) : HomePage;
  const showOnboarding = user && profile && !hasSeenOnboarding && !isReturningUser;

  return (
    <div className={`app-shell${amoled ? " amoled" : ""}`}>
      {draftRecovered && (
        <div style={{ position: "fixed", top: "max(env(safe-area-inset-top,0px),0px)", left: 0, right: 0, zIndex: 9999, background: "rgba(168,85,247,.15)", borderBottom: "1px solid rgba(168,85,247,.4)", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: "var(--green)", fontWeight: 700 }}>Entrenamiento recuperado</span>
          <button style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 16, cursor: "pointer", padding: "0 4px" }} onClick={() => setDraftRecovered(false)}>✕</button>
        </div>
      )}
      <main className="app-main">
        <ErrorBoundary resetKey={currentPage}>
          <Suspense fallback={<div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}><div className="spin" style={{ width:32, height:32, border:"3px solid var(--line)", borderTopColor:"var(--green)", borderRadius:"50%" }} /></div>}>
            <PageComponent />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Nav role={role} />
      {showOnboarding && <OnboardingModal />}

      {/* ── FIRST LOGIN / PASSWORD RECOVERY MODAL ──────────────────────── */}
      {(showPasswordModal || profile?.has_changed_password === false) && (
        <div style={{ position:"fixed", inset:0, zIndex:10001, background:"rgba(0,0,0,.8)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"var(--panel)", borderRadius:20, padding:"28px 24px", width:"100%", maxWidth:360 }}>
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <div style={{ fontSize:40, marginBottom:8 }}>🔐</div>
              <h2 style={{ margin:"0 0 6px" }}>Cambiá tu contraseña</h2>
              <p style={{ color:"var(--muted)", fontSize:13, margin:0 }}>
                {showPasswordModal ? "Ingresá tu nueva contraseña." : "Es tu primer acceso. Elegí una contraseña segura para tu cuenta."}
              </p>
            </div>
            <div style={{ marginBottom:12 }}>
              <input
                type="password"
                placeholder="Nueva contraseña (mín. 6 caracteres)"
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setPasswordError(""); }}
                style={{ width:"100%", padding:"13px 14px", borderRadius:12, border:"1.5px solid var(--line)", background:"var(--panel2)", color:"var(--text)", fontSize:14, boxSizing:"border-box" }}
              />
            </div>
            {passwordError && <p style={{ color:"var(--danger)", fontSize:12, margin:"0 0 10px", textAlign:"center" }}>{passwordError}</p>}
            <button className="primary" style={{ width:"100%" }} disabled={passwordLoading || newPassword.length < 6}
              onClick={async () => {
                if (newPassword.length < 6) { setPasswordError("La contraseña debe tener al menos 6 caracteres."); return; }
                setPasswordLoading(true);
                setPasswordError("");
                const { error } = await supabase.auth.updateUser({ password: newPassword });
                if (error) { setPasswordError(error.message); setPasswordLoading(false); return; }
                // Mark password as changed in profile
                try {
                  const uid = useAuthStore.getState().user?.id;
                  if (uid) await supabase.from("profiles").update({ has_changed_password: true }).eq("id", uid);
                } catch {}
                useAuthStore.setState(s => ({ profile: s.profile ? { ...s.profile, has_changed_password: true } : s.profile }));
                setShowPasswordModal(false);
                setNewPassword("");
                setPasswordLoading(false);
              }}>
              {passwordLoading ? "Guardando…" : "Guardar contraseña"}
            </button>
            {showPasswordModal && (
              <button className="ghost" style={{ width:"100%", marginTop:8, color:"var(--muted)", fontSize:12 }}
                onClick={() => { setShowPasswordModal(false); setNewPassword(""); }}>
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}

      {showNovedades && (
        <NovedadesModal onClose={() => { setShowNovedades(false); markVersionSeen(APP_VERSION); }} />
      )}
      {swUpdateReady && (
        <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:9999,
          background:"var(--green)", color:"#050709", padding:"12px 16px",
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
          <span style={{ fontSize:14, fontWeight:700 }}>Nueva versión disponible</span>
          <button onClick={() => window.location.reload()}
            style={{ background:"#050709", color:"var(--green)", border:"none",
              padding:"7px 16px", borderRadius:8, fontWeight:700, fontSize:13, cursor:"pointer" }}>
            Actualizar
          </button>
        </div>
      )}
      {showInstallBanner && !showNovedades && (
        <InstallBanner
          isIOS={isIOS}
          onDismiss={() => setShowInstallBanner(false)}
          onInstall={async () => {
            setShowInstallBanner(false);
            if (installPrompt) {
              await installPrompt.prompt();
              setInstallPrompt(null);
            }
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  const fontScale = useStore(s => s.fontScale) || 1;
  const autoDarkMode = useStore(s => s.autoDarkMode) || false;

  // Apply font scale to root element
  useEffect(() => {
    document.documentElement.style.fontSize = fontScale === 1 ? "" : `${fontScale * 100}%`;
  }, [fontScale]);

  // Apply auto dark mode
  useEffect(() => {
    if (!autoDarkMode) return;
    function checkDark() {
      const h = new Date().getHours();
      const isDark = h >= 19 || h < 8;
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    }
    checkDark();
    const interval = setInterval(checkDark, 60000);
    return () => clearInterval(interval);
  }, [autoDarkMode]);

  return (
    <Router hook={useHashLocation}>
      <AppContent />
    </Router>
  );
}

