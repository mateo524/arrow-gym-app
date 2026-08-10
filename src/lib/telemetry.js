/**
 * Telemetría centralizada de Loop Gym.
 * Un solo punto de entrada — nunca importar posthog directamente en componentes.
 *
 * Cada evento lleva automáticamente: ui_mode, role, subscription_status, days_since_signup.
 * Pasar props adicionales como segundo argumento.
 */

let _profile = null;

export function telemetrySetProfile(profile) {
  _profile = profile;
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
  try {
    import("posthog-js").then(({ default: ph }) => {
      if (typeof ph.capture !== "function") return;
      ph.capture(event, { ...baseProps(), ...props });
    });
  } catch {}
}

// ─── Eventos del funnel ────────────────────────────────────────────────────

export const T = {
  // Onboarding
  signup: (props = {}) => track("signup", props),
  onboardingCompleted: (props = {}) => track("onboarding_completed", props),

  // Entrenamientos
  workoutStarted: (props = {}) => track("workout_started", props),
  setLogged: (props = {}) => track("set_logged", props),
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

  // Sesión
  sessionStart: (props = {}) => track("session_start", props),

  // Progreso (PRs)
  prHit: (exercise, value, props = {}) =>
    track("pr_hit", { exercise, value, ...props }),
};
