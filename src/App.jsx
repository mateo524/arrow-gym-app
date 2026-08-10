import { useEffect, useRef, useState, Component, lazy, Suspense } from "react";
import { telemetrySetProfile, T } from "./lib/telemetry.js";
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
const BadgesPage         = lazy(() => import("./pages/BadgesPage.jsx"));
const HealthSyncPage     = lazy(() => import("./pages/HealthSyncPage.jsx"));
const ChallengesPage     = lazy(() => import("./pages/ChallengesPage.jsx"));
const ReferralPage       = lazy(() => import("./pages/ReferralPage.jsx"));
const TestamentoPage     = lazy(() => import("./pages/TestamentoPage.jsx"));
const LeaguePage         = lazy(() => import("./pages/LeaguePage.jsx"));
const TrainerLandingPage = lazy(() => import("./pages/TrainerLandingPage.jsx"))
const WorkoutSharePage   = lazy(() => import("./pages/WorkoutSharePage.jsx"));
const NutritionPage      = lazy(() => import("./pages/NutritionPage.jsx"));
import Nav from "./components/Nav.jsx";
import OnboardingModal from "./components/OnboardingModal.jsx";
import PRCard from "./components/PRCard.jsx";
import useStore from "./store/useStore.js";
import useAuthStore from "./store/useAuthStore.js";
import { supabase } from "./lib/supabase.js";
import { subscribeToPush, requestPushPermission, isPushSupported } from "./lib/pushNotifications.js";

const APP_VERSION = "54";

// Always dark mode
document.documentElement.removeAttribute("data-theme");
localStorage.removeItem("loop-theme");

function InstallBanner({ onInstall, onDismiss, isIOS }) {
  if (isIOS) {
    return (
      <div style={{ position:"fixed", bottom:80, left:12, right:12, zIndex:9997, background:"var(--panel)", border:"1px solid var(--border)", borderRadius:16, padding:"14px 16px", boxShadow:"0 4px 24px rgba(0,0,0,.5)" }}>
        <button onClick={onDismiss} style={{ position:"absolute", top:10, right:12, background:"none", border:"none", color:"var(--muted)", fontSize:18, cursor:"pointer" }}>?</button>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
          <img src="/icon-192.png" width={40} height={40} style={{ borderRadius:10 }} alt="Loop" />
          <div>
            <div style={{ fontWeight:800, fontSize:14 }}>Instalá Loop</div>
            <div style={{ fontSize:12, color:"var(--muted)" }}>Accedé desde tu pantalla de inicio</div>
          </div>
        </div>
        <div style={{ fontSize:13, color:"var(--muted)", lineHeight:1.6 }}>
          Para activar notificaciones, instalá la app: tocá <b style={{ color:"var(--text)" }}>?? Compartir</b> y después <b style={{ color:"var(--text)" }}>"Agregar al inicio"</b>
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
  badges: BadgesPage,
healthsync: HealthSyncPage,
  challenges: ChallengesPage,
  referral: ReferralPage,
  testamento: TestamentoPage,
  league: LeaguePage,
  nutrition: NutritionPage,
};

function AppContent() {
  const [location, setLocation] = useLocation();
  const currentPage = useStore((s) => s.currentPage);
  const activeWorkout = useStore((s) => s.activeWorkout);
  const setPage = useStore((s) => s.setPage);
  const currentPRCard = useStore((s) => s.currentPRCard);
  const clearPRCard = useStore((s) => s.clearPRCard);
  const lastSeenVersion = useStore((s) => s.lastSeenVersion);
  const markVersionSeen = useStore((s) => s.markVersionSeen);
  const [installPrompt, setInstallPrompt] = useState(null);   // Android: deferred prompt
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [swUpdateReady, setSwUpdateReady] = useState(false);
  const [draftRecovered, setDraftRecovered] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [subscribing, setSubscribing] = useState(false);
  const [trialBannerDismissed, setTrialBannerDismissed] = useState(
    () => localStorage.getItem("trial-banner-dismissed-day") === new Date().toDateString()
  );
  const [trainerLandingCode, setTrainerLandingCode] = useState(
    () => localStorage.getItem("pending_trainer_landing") || null
  );
  const [shareData, setShareData] = useState(() => {
    // Detect #/share/BASE64 on first load
    const h = window.location.hash.replace(/^#\/?/, "");
    if (h.startsWith("share/")) return h.replace("share/", "").trim();
    return null;
  });

  async function startSubscription() {
    T.checkoutStarted();
    setSubscribing(true);
    try {
      const { data, error } = await supabase.functions.invoke("mp-create-subscription");
      if (error || !data?.init_point) {
        if (data?.error === "no_mp_token") {
          alert("El sistema de pagos no está configurado aún. Contactá a tu entrenador.");
        } else {
          alert("No se pudo iniciar el pago. Intentá de nuevo.");
        }
        return;
      }
      window.open(data.init_point, "_blank");
    } catch {
      alert("Error de conexión. Verificá tu red e intentá de nuevo.");
    } finally {
      setSubscribing(false);
    }
  }

  const { user, profile, loading, init } = useAuthStore();

  // Telemetría: sincronizar perfil y registrar session_start
  useEffect(() => {
    if (!profile) return;
    telemetrySetProfile(profile);
    T.sessionStart();
  }, [profile?.id]);

  // These three hooks MUST live before any early return to satisfy React Rules of Hooks
  const hasSeenOnboarding = useStore(s => s.hasSeenOnboarding);
  const markOnboardingSeen = useStore(s => s.markOnboardingSeen);
  const workouts = useStore(s => s.workouts) || [];
  const newAchievements = useStore(s => s.newAchievements) || [];
  const clearNewAchievements = useStore(s => s.clearNewAchievements);
  const [achToast, setAchToast] = useState(null);

  // Show achievement unlock toast when new badges are earned
  useEffect(() => {
    if (!newAchievements.length) return;
    const first = newAchievements[0];
    setAchToast(first);
    const t = setTimeout(() => { setAchToast(null); clearNewAchievements(); }, 4000);
    return () => clearTimeout(t);
  }, [newAchievements.length]);
  // Check URL params on initial load (Supabase cleans URL before first effect runs)
  const [showPasswordModal, setShowPasswordModal] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("type") === "recovery";
  });
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const isReturningUser = workouts.length > 0 || Boolean(profile?.goal) || Boolean(profile?.fitness_level) || Boolean(profile?.weight_kg);

  // PWA install prompt — Android: capture beforeinstallprompt; iOS: detect Safari
  useEffect(() => {
    // Don't show if already installed as standalone
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (window.navigator.standalone === true) return; // iOS standalone

    // iOS detection — they don't have beforeinstallprompt, need manual instructions
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    if (ios) {
      const dismissed = localStorage.getItem('install-dismissed-permanently');
      if (!dismissed) {
        setTimeout(() => { setIsIOS(true); setShowInstallBanner(true); }, 10000);
      }
      return;
    }

    // Android / Chrome: listen for the deferred prompt
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      const dismissed = localStorage.getItem('install-dismissed-permanently');
      if (!dismissed) {
        setTimeout(() => setShowInstallBanner(true), 3000);
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

  // Background Sync: the SW notifies open tabs to flush pending gym data.
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const handler = (event) => {
      if (event.data?.type === 'BACKGROUND_SYNC_REQUESTED') {
        useStore.getState().syncGymStateToDB?.();
      }
    };
    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
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

  // Online/offline banner state + flush pending Zustand syncs on reconnect
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // flushPendingSyncs handled by the offline-queue listener above — no duplicate flush here
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Show password change modal when redirected from forgot-password email
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setShowPasswordModal(true);
      if (event === "SIGNED_IN") {
        T.sessionStart({ trigger: "auth_state_change" });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Push subscription is handled by the ProfilePage toggle (user gesture required on iOS).
  // On re-auth, preserve any existing subscription stored in localStorage.

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

  // Push notification: ask permission once, fire at most once per day if inactive 3+ days
  useEffect(() => {
    if (!user || !("Notification" in window)) return;
    const lastNotif = localStorage.getItem("loop-last-notif");
    if (lastNotif && Date.now() - Number(lastNotif) < 86400000) return;
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
        `Llevas ${daysSince} días sin entrenar. ¡El gym te extraña!`,
        `${daysSince} días de descanso... ¿será que ya descansaste suficiente?`,
        `Tu racha está en pausa hace ${daysSince} días. ¡Volvé hoy!`,
      ];
      const opts = {
        body: msgs[daysSince % msgs.length],
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "inactivity",
      };
      navigator.serviceWorker.ready.then(r => r.showNotification("Loop Gym", opts)).catch(() => {});
      localStorage.setItem("loop-last-notif", String(Date.now()));
    };
    if (Notification.permission === "granted") {
      notify();
    } else if (Notification.permission === "default") {
      Notification.requestPermission().then(p => { if (p === "granted") notify(); }).catch(() => {});
    }
  }, [user]);

  // Backup active workout to sessionStorage every time it changes.
  // sessionStorage survives iOS PWA app switches (unlike in-memory state).
  useEffect(() => {
    if (activeWorkout) {
      sessionStorage.setItem("loop-gym-active-workout", JSON.stringify(activeWorkout));
    } else {
      sessionStorage.removeItem("loop-gym-active-workout");
    }
  }, [activeWorkout]);

  // On mount: recover active workout from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("loop-gym-active-workout");
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
    // Detect invite link: #/join/CODE or /join/CODE in pathname
    const hashPath = location.replace(/^\//, "");
    const pathnamePath = window.location.pathname.replace(/^\//, "");
    const joinPath = hashPath.startsWith("join/") ? hashPath : pathnamePath.startsWith("join/") ? pathnamePath : null;
    if (joinPath) {
      const code = joinPath.replace("join/", "").trim();
      if (code) localStorage.setItem("pending_invite_code", code);
      setPage("home");
      return;
    }
    // Student referral link: #/invite/REFERRAL_CODE
    const invitePath = hashPath.startsWith("invite/") ? hashPath : pathnamePath.startsWith("invite/") ? pathnamePath : null;
    if (invitePath) {
      const code = invitePath.replace("invite/", "").trim();
      if (code) localStorage.setItem("pending_referral_code", code);
      setPage("home");
      return;
    }
    // Workout share link: #/share/BASE64
    const sharePath = hashPath.startsWith("share/") ? hashPath : pathnamePath.startsWith("share/") ? pathnamePath : null;
    if (sharePath) {
      const data = sharePath.replace("share/", "").trim();
      if (data) setShareData(data);
      return;
    }
    // Trainer public landing: #/t/INVITE_CODE
    const trainerPath = hashPath.startsWith("t/") ? hashPath : pathnamePath.startsWith("t/") ? pathnamePath : null;
    if (trainerPath) {
      const code = trainerPath.replace("t/", "").trim();
      if (code) localStorage.setItem("pending_trainer_landing", code);
      setPage("home");
      return;
    }
    // Trainer-to-trainer invite: #/trainer-invite/CODE
    const trainerInvitePath = hashPath.startsWith("trainer-invite/") ? hashPath : pathnamePath.startsWith("trainer-invite/") ? pathnamePath : null;
    if (trainerInvitePath) {
      const code = trainerInvitePath.replace("trainer-invite/", "").trim();
      if (code) localStorage.setItem("pending_trainer_invite", code);
      setPage("home");
      return;
    }
    if (PAGE_MAP[hashPath] && hashPath !== currentPage) setPage(hashPath);
  }, []); // eslint-disable-line

  // After login: resolve pending trainer invite code (student ? linked to trainer)
  useEffect(() => {
    if (!user?.id) return;
    const code = localStorage.getItem("pending_invite_code");
    if (!code) return;
    localStorage.removeItem("pending_invite_code");
    (async () => {
      const { data, error } = await supabase.rpc("request_trainer_from_invite", { p_invite_code: code });
      if (!error && data?.ok) {
        window.__showToast?.(`Solicitud enviada a ${data.trainer_name || "tu entrenador"} ???. Te avisamos cuando la acepte.`, "success");
      } else if (data?.error !== "invalid_code") {
        // Fallback: just set referred_by for commission tracking
        const { data: inv } = await supabase.from("invite_codes").select("trainer_id").eq("code", code).maybeSingle();
        if (inv?.trainer_id && inv.trainer_id !== user.id) {
          await supabase.from("profiles").update({ referred_by: inv.trainer_id }).eq("id", user.id);
        }
      }
    })();
  }, [user?.id]); // eslint-disable-line

  // After login: resolve pending trainer-to-trainer invite (assigns trainer role via RPC)
  useEffect(() => {
    if (!user?.id) return;
    const code = localStorage.getItem("pending_trainer_invite");
    if (!code) return;
    localStorage.removeItem("pending_trainer_invite");
    (async () => {
      const { data, error } = await supabase.rpc("use_trainer_invite", { invite_code: code });
      if (!error && data?.ok) {
        // Reload profile so the new role takes effect
        const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
        if (p) useAuthStore.getState().setProfile(p);
        window.__showToast?.("¡Ya sos entrenador en Loop! ???", "success");
      } else if (data?.error === "invalid_or_expired") {
        window.__showToast?.("El link de invitación ya fue usado o expiró.", "error");
      }
    })();
  }, [user?.id]); // eslint-disable-line

  // After login: resolve pending student referral code
  useEffect(() => {
    if (!user?.id) return;
    const code = localStorage.getItem("pending_referral_code");
    if (!code) return;
    localStorage.removeItem("pending_referral_code");
    (async () => {
      const { data } = await supabase.from("profiles")
        .select("id").eq("referral_code", code).maybeSingle();
      if (data?.id && data.id !== user.id) {
        // Set the referrer on current user's profile (only if not already set)
        const { data: me } = await supabase.from("profiles")
          .select("student_referrer_id").eq("id", user.id).maybeSingle();
        if (!me?.student_referrer_id) {
          await supabase.from("profiles")
            .update({ student_referrer_id: data.id }).eq("id", user.id);
          // Record as pending conversion in student_referrals
          await supabase.from("student_referrals")
            .upsert({ referrer_id: data.id, referee_id: user.id }, { onConflict: "referee_id" });
        }
      }
    })();
  }, [user?.id]); // eslint-disable-line

  // Store ? URL (one-way, no feedback loop)
  useEffect(() => {
    const path = "/" + currentPage;
    if (path !== location) setLocation(path, { replace: true });
  }, [currentPage]);

  // These effects reference user/profile so they must also be before any early return
  useEffect(() => {
    if (isReturningUser && !hasSeenOnboarding && profile?.id && (profile?.goal || profile?.fitness_level)) {
      markOnboardingSeen();
    }
  }, [isReturningUser, hasSeenOnboarding, profile]);

  // Show a minimal splash ONLY when there's no cached session at all
  // (first load, logged out). If there's a cached user we skip the splash
  // entirely so returning to the app feels instant.
  // Show splash while: (a) initial load with no cached session, or (b) session
  // refreshed but profile hasn't loaded yet — prevents the black screen on iOS PWA
  // when the app is opened after the JWT has expired.
  const splashScreen = loading || (user && !profile);
  const showLogin = !splashScreen && !user;

  // Access control
  const subStatus = profile?.subscription_status;
  const role = profile?.role;
  const isTrainer = role === "trainer";
  const isAdminRole = ["superadmin", "admin", "trainer"].includes(role);
  // Trainers always have full access — no paywall, no trial expiry
  const accountAgeMs = profile?.created_at ? Date.now() - new Date(profile.created_at).getTime() : 0;
  const TRIAL_MS = 30 * 24 * 60 * 60 * 1000;
  // subscription_expires_at: if set and in the future, treat as active even if status wasn't updated yet
  const subExpiresAt = profile?.subscription_expires_at ? new Date(profile.subscription_expires_at) : null;
  const subNotExpired = subExpiresAt && subExpiresAt > new Date();
  // Trial is active when account is < 30 days old (regardless of subStatus)
  const hasAccess = isAdminRole || subStatus === "active" || subStatus === "trialing" || subNotExpired || accountAgeMs <= TRIAL_MS;
  // Trial expired when > 30 days old AND not active/trialing AND sub not paid (includes null subStatus after trial ends)
  const trialExpired = !isAdminRole && accountAgeMs > TRIAL_MS && subStatus !== "active" && subStatus !== "trialing" && !subNotExpired;

  const PAGE_ROLE_GUARDS = {
    admin: ["admin", "superadmin"],
    trainer: ["trainer", "admin", "superadmin"],
    referral: ["trainer", "admin", "superadmin"],
    testamento: ["trainer", "admin", "superadmin"],
  };
  const requiredRoles = PAGE_ROLE_GUARDS[currentPage];
  const isAllowed = !requiredRoles || requiredRoles.includes(role);
  const PageComponent = isAllowed ? (PAGE_MAP[currentPage] || HomePage) : HomePage;
  const showOnboarding = user && profile && !hasSeenOnboarding && !isReturningUser && !showPasswordModal;

  let inner;
  if (shareData) {
    inner = (
      <Suspense fallback={<div style={{ minHeight:"100dvh", background:"#050408", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,.4)", fontSize:14 }}>Cargando…</div>}>
        <WorkoutSharePage data={shareData} />
      </Suspense>
    );
  } else if (splashScreen) {
    inner = (
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
  } else if (showLogin && trainerLandingCode) {
    inner = (
      <Suspense fallback={<div style={{ minHeight:"100dvh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--muted)", fontSize:14 }}>Cargando…</div>}>
        <TrainerLandingPage
          inviteCode={trainerLandingCode}
          onJoin={() => {
            // Preserve the invite code so onboarding step 5 picks it up
            localStorage.setItem("pending_invite_code", trainerLandingCode);
            localStorage.removeItem("pending_trainer_landing");
            setTrainerLandingCode(null);
          }}
          onBack={() => {
            localStorage.removeItem("pending_trainer_landing");
            setTrainerLandingCode(null);
          }}
        />
      </Suspense>
    );
  } else if (showLogin) {
    inner = <LoginPage />;
  } else if (!hasAccess && !trialExpired) {
    inner = (
      <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:16 }}>??</div>
        <h2 style={{ margin:"0 0 8px" }}>Suscripción vencida</h2>
        <p style={{ color:"var(--muted)", fontSize:14, marginBottom:24 }}>Renovó tu plan para seguir entrenando con la app.</p>
        <button className="primary" style={{ marginBottom:12 }} disabled={subscribing} onClick={startSubscription}>
          {subscribing ? "Conectando…" : "Renovar plan"}
        </button>
        <button className="ghost" onClick={() => useAuthStore.getState().logout()}>Cerrar sesión</button>
      </div>
    );
  } else if (trialExpired) {
    T.paywallShown("trial_expired", { days_since_signup: Math.floor(accountAgeMs / 86400000) });
    inner = (
      <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>?</div>
        <h2 style={{ margin:"0 0 8px" }}>Hola {profile?.name || profile?.email?.split("@")[0] || ""},</h2>
        <p style={{ color:"var(--muted)", fontSize:15, marginBottom:8 }}>Tu período de prueba terminó.</p>
        <p style={{ color:"var(--muted)", fontSize:14, marginBottom:24, lineHeight:1.6 }}>
          Activá tu suscripción para seguir entrenando con tu coach por <b style={{ color:"var(--text)" }}>$10.000 ARS/mes</b>.
        </p>
        <button className="primary" style={{ marginBottom:12, padding:"14px 28px", fontSize:15 }}
          disabled={subscribing} onClick={startSubscription}>
          {subscribing ? "Conectando…" : "Suscribirme ahora"}
        </button>
        <button className="ghost" style={{ color:"var(--muted)", fontSize:13 }} onClick={() => useAuthStore.getState().logout()}>
          Cerrar sesión
        </button>
      </div>
    );
  } else {
    inner = (
      <div className="app-shell">
        {/* -- TRIAL COUNTDOWN BANNER --------------------------------------- */}
        {(() => {
          if (isAdminRole || trialBannerDismissed) return null;
          if (subStatus === "active") return null;
          const daysLeft = 30 - Math.floor(accountAgeMs / (24 * 60 * 60 * 1000));
          if (daysLeft > 7 || daysLeft <= 0) return null;
          const urgent = daysLeft <= 3;
          return (
            <div style={{
              position: "fixed", top: 0, left: 0, right: 0, zIndex: 9998,
              background: urgent ? "rgba(239,68,68,.95)" : "rgba(168,85,247,.92)",
              backdropFilter: "blur(8px)", padding: "10px 16px",
              display: "flex", alignItems: "center", gap: 10, fontSize: 13,
            }}>
              <span style={{ flex: 1, fontWeight: 700, color: "#fff" }}>
                {urgent ? "??" : "?"} {daysLeft === 1 ? "¡Último día de prueba!" : `Te quedan ${daysLeft} días de prueba gratuita`}
              </span>
              <button
                onClick={() => { setSubscribing(true); startSubscription(); }}
                disabled={subscribing}
                style={{ background: "#fff", color: urgent ? "#ef4444" : "#a855f7", border: "none", borderRadius: 8, padding: "6px 12px", fontWeight: 800, fontSize: 12, cursor: "pointer", flexShrink: 0 }}
              >
                {subscribing ? "…" : "Suscribirme"}
              </button>
              <button
                onClick={() => { localStorage.setItem("trial-banner-dismissed-day", new Date().toDateString()); setTrialBannerDismissed(true); }}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,.7)", fontSize: 18, cursor: "pointer", padding: "0 4px", flexShrink: 0 }}
              >?</button>
            </div>
          );
        })()}
        {draftRecovered && (
          <div style={{ position: "fixed", top: "max(env(safe-area-inset-top,0px),0px)", left: 0, right: 0, zIndex: 9999, background: "rgba(168,85,247,.15)", borderBottom: "1px solid rgba(168,85,247,.4)", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "var(--green)", fontWeight: 700 }}>Entrenamiento recuperado</span>
            <button style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 16, cursor: "pointer", padding: "0 4px" }} onClick={() => setDraftRecovered(false)}>?</button>
          </div>
        )}
        <main className="app-main">
          <Suspense fallback={<div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh", color:"var(--text-muted)" }}>Cargando...</div>}>
            <PageComponent />
          </Suspense>
        </main>
        {showOnboarding && <OnboardingModal />}
      </div>
    );
  }

  return (
    <ErrorBoundary resetKey={currentPage}>
      {!isOnline && (
        <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:9999, background:"rgba(245,158,11,.9)", color:"#000", fontSize:12, fontWeight:700, textAlign:"center", padding:"6px", backdropFilter:"blur(8px)" }}>
          Sin conexión — tus datos se guardan localmente
        </div>
      )}
      {/* -- ACHIEVEMENT UNLOCK TOAST --------------------------------------- */}
      {achToast && (
        <div style={{
          position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)",
          zIndex: 9997, background: "var(--panel)", border: "1.5px solid #f59e0b",
          borderRadius: 16, padding: "12px 18px", boxShadow: "0 4px 24px rgba(0,0,0,.5)",
          display: "flex", alignItems: "center", gap: 12, maxWidth: 320, width: "calc(100% - 32px)",
          animation: "slideUp .3s ease",
        }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>??</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#f59e0b" }}>¡Logro desbloqueado!</div>
            <div style={{ fontSize: 12, color: "var(--text)", marginTop: 2 }}>{achToast.title || achToast.id}</div>
          </div>
          <button onClick={() => { setAchToast(null); clearNewAchievements(); }}
            style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 16, cursor: "pointer", padding: "0 4px", flexShrink: 0, marginLeft: "auto" }}>?</button>
        </div>
      )}
      {inner}
      {user && hasAccess && <Nav role={role} />}
      {currentPRCard && (
        <PRCard
          pr={{ exercise: currentPRCard.exercise, weight: currentPRCard.newWeight, reps: currentPRCard.reps, unit: "kg" }}
          totalWorkouts={currentPRCard.daysTraining}
          onClose={clearPRCard}
        />
      )}

      {/* -- FIRST LOGIN / PASSWORD RECOVERY MODAL ------------------------ */}
      {(showPasswordModal || (profile?.has_changed_password === false && profile?.trainer_id && !sessionStorage.getItem("pw-modal-dismissed"))) && (
        <div style={{ position:"fixed", inset:0, zIndex:10001, background:"rgba(0,0,0,.8)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"var(--panel)", borderRadius:20, padding:"28px 24px", width:"100%", maxWidth:360 }}>
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <div style={{ fontSize:40, marginBottom:8 }}>??</div>
              <h2 style={{ margin:"0 0 6px" }}>Cambió tu contraseña</h2>
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
                onClick={() => { setShowPasswordModal(false); setNewPassword(""); sessionStorage.setItem("pw-modal-dismissed", "1"); }}>
                Cancelar
              </button>
            )}
          </div>
        </div>
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
      {showInstallBanner && (
        <InstallBanner
          isIOS={isIOS}
          onDismiss={() => {
            setShowInstallBanner(false);
            localStorage.setItem('install-dismissed-permanently', '1');
            if (isIOS) localStorage.setItem('install-ios-shown-at', String(Date.now()));
          }}
          onInstall={async () => {
            setShowInstallBanner(false);
            if (installPrompt) {
              await installPrompt.prompt();
              setInstallPrompt(null);
            }
          }}
        />
      )}
    </ErrorBoundary>
  );
}

export default function App() {
  const fontScale = useStore(s => s.fontScale) || 1;
  const autoDarkMode = useStore(s => s.autoDarkMode) || false;
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef(null);

  // Expose global toast function
  useEffect(() => {
    window.__showToast = (msg) => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToastMsg(msg);
      toastTimer.current = setTimeout(() => { setToastMsg(""); toastTimer.current = null; }, 2200);
    };
    return () => { window.__showToast = undefined; };
  }, []);

  // Apply zoom via CSS custom property — avoids iOS page-reload bug triggered
  // by setting document.documentElement.style.zoom directly.
  useEffect(() => {
    document.documentElement.style.setProperty("--app-zoom", String(fontScale || 1));
  }, [fontScale]);


  return (
    <Router hook={useHashLocation}>
      <AppContent />
      {/* Global toast */}
      {toastMsg && (
        <div style={{
          position:"fixed", bottom:"calc(80px + env(safe-area-inset-bottom, 0px))",
          left:"50%", transform:"translateX(-50%)", zIndex:99999,
          background:"var(--green)", color:"#050709",
          padding:"10px 20px", borderRadius:12,
          fontSize:14, fontWeight:700,
          boxShadow:"0 4px 20px rgba(0,0,0,.4)",
          animation:"toast-in .25s ease",
          whiteSpace:"nowrap",
        }}>{toastMsg}</div>
      )}
    </Router>
  );
}




