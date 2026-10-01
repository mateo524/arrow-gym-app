/**
 * Telemetría centralizada de Loop Gym.
 * Un solo punto de entrada — nunca importar posthog directamente en componentes.
 *
 * PostHog NO se inicia hasta que el usuario acepta el banner de analítica
 * (ConsentBanner). Sin consentimiento, track() no hace nada.
 *
 * Cada evento lleva automáticamente: ui_mode, role, subscription_status, days_since_signup.
 * Privacidad: no se envían datos de salud crudos (peso, reps, medidas) ni email/nombre.
 */

const CONSENT_KEY = "loop-analytics-consent"; // "granted" | "denied"
const PH_KEY = import.meta.env.VITE_POSTHOG_KEY;

let _profile = null;
let _ph = null;          // instancia de posthog una vez iniciada
let _initPromise = null;
let _identifiedId = null;
const _listeners = new Set();

export function getConsent() {
  try { return localStorage.getItem(CONSENT_KEY); } catch { return null; }
}

export function onConsentChange(fn) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

function loadPosthog() {
  if (!PH_KEY || getConsent() !== "granted") return Promise.resolve(null);
  if (_initPromise) return _initPromise;
  _initPromise = import("posthog-js")
    .then(({ default: ph }) => {
      ph.init(PH_KEY, {
        api_host: "https://app.posthog.com",
        autocapture: false,
        capture_pageview: false,
        disable_session_recording: true,
        persistence: "localStorage",
      });
      _ph = ph;
      syncIdentity();
      emitLifecycleEvents();
      return ph;
    })
    .catch(() => { _initPromise = null; return null; });
  return _initPromise;
}

/** Llamar al arrancar la app: inicia PostHog solo si ya hay consentimiento previo. */
export function initAnalyticsIfConsented() {
  if (getConsent() === "granted") loadPosthog();
}

export function setConsent(granted) {
  try { localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied"); } catch {}
  if (granted) {
    loadPosthog();
  } else if (_ph) {
    try { _ph.opt_out_capturing?.(); _ph.reset?.(); } catch {}
    _ph = null; _initPromise = null; _identifiedId = null;
  }
  _listeners.forEach((fn) => { try { fn(); } catch {} });
}

function syncIdentity() {
  if (!_ph) return;
  try {
    if (_profile?.id) {
      if (_identifiedId !== _profile.id) {
        // Solo ID interno: sin email ni nombre.
        _ph.identify(_profile.id);
        _identifiedId = _profile.id;
      }
    } else if (_identifiedId) {
      _ph.reset();
      _identifiedId = null;
      _sessionStartedFor = null;
    }
  } catch {}
}

export function telemetrySetProfile(profile) {
  _profile = profile || null;
  if (!_profile) _sessionStartedFor = null;
  syncIdentity();
  if (_profile) emitLifecycleEvents();
}

function baseProps() {
  if (!_profile) return {};
  const createdAt = _profile.created_at ? new Date(_profile.created_at) : null;
  const daysSince = createdAt
    ? Math.floor((Date.now() - createdAt.getTime()) / 86400000)
    : null;
  return {
    ui_mode: _profile.ui_mode ?? "standard",
    role: _profile.role ?? "user",
    subscription_status: _profile.subscription_status ?? "inactive",
    days_since_signup: daysSince,
  };
}

export function track(event, props = {}) {
  if (!PH_KEY || getConsent() !== "granted") return;
  loadPosthog()
    .then((ph) => {
      if (!ph || typeof ph.capture !== "function") return;
      ph.capture(event, { ...baseProps(), ...props });
    })
    .catch(() => {});
}

// ─── Eventos de ciclo de vida (una sola vez por usuario) ───────────────────

function onceFor(name, userId) {
  const key = `loop-tel-${name}-${userId}`;
  try {
    if (localStorage.getItem(key)) return false;
    localStorage.setItem(key, "1");
  } catch { return false; }
  return true;
}

function emitLifecycleEvents() {
  if (!_profile?.id || !_ph) return;
  const id = _profile.id;
  const ageMs = _profile.created_at ? Date.now() - new Date(_profile.created_at).getTime() : Infinity;
  // Cuenta creada en las últimas 48 hs → signup
  if (ageMs < 48 * 3600 * 1000 && onceFor("signup", id)) track("signup");
  if (_profile.subscription_status === "active" && onceFor("subscription_active", id)) {
    track("subscription_active");
  }
}

let _sessionStartedFor = null;
function sessionStartOnce(props) {
  if (getConsent() !== "granted") return;
  const id = _profile?.id || "anon";
  if (_sessionStartedFor === id) return;
  _sessionStartedFor = id;
  track("session_start", props);
}

// ─── Eventos del funnel ────────────────────────────────────────────────────

export const T = {
  // Onboarding
  signup: (props = {}) => track("signup", props),
  onboardingCompleted: (props = {}) => {
    if (getConsent() !== "granted") return;
    if (_profile?.id && !onceFor("onboarding", _profile.id)) return;
    track("onboarding_completed", props);
  },

  // Entrenamientos
  workoutStarted: (props = {}) => track("workout_started", props),
  // Sin peso/reps crudos: solo ejercicio.
  setLogged: ({ exercise } = {}) => track("set_logged", { exercise }),
  workoutFinished: (props = {}) => track("workout_finished", props),

  // Hitos de activación (2 y 4 entrenamientos predicen retención D30)
  workoutN: (n, props = {}) => track(`workout_${n}`, props),

  // Coach IA
  coachSuggestionShown: (ruleId, props = {}) =>
    track("coach_suggestion_shown", { rule_id: ruleId, ...props }),
  coachSuggestionAccepted: (ruleId, props = {}) =>
    track("coach_suggestion_accepted", { rule_id: ruleId, ...props }),
  coachSuggestionDismissed: (ruleId, props = {}) =>
    track("coach_suggestion_dismissed", { rule_id: ruleId, ...props }),

  // Conversión
  paywallShown: (trigger, props = {}) =>
    track("paywall_shown", { trigger, ...props }),
  checkoutStarted: (props = {}) => track("checkout_started", props),
  subscriptionActive: (props = {}) => track("subscription_active", props),

  // Sesión (una vez por usuario por carga de app)
  sessionStart: (props = {}) => sessionStartOnce(props),

  // Progreso (PRs): sin valores crudos, solo ejercicio y tipo.
  prHit: (exercise, props = {}) => track("pr_hit", { exercise, ...props }),
};
