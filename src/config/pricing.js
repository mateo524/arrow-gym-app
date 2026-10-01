// Fuente única de precios y reglas de trial/suscripción de Loop Gym.
export const PRICE_ARS = 10000;
export const TRIAL_DAYS = 30;
// Días sin entrenar a partir de los cuales un alumno se considera inactivo (semáforo/banner/docs).
export const INACTIVITY_DAYS = 5;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Info del trial según la antigüedad de la cuenta (profile.created_at). */
export function getTrialInfo(profile) {
  const ageMs = profile?.created_at ? Date.now() - new Date(profile.created_at).getTime() : 0;
  const daysLeft = Math.max(0, TRIAL_DAYS - Math.floor(ageMs / DAY_MS));
  return { ageMs, daysLeft, active: ageMs <= TRIAL_DAYS * DAY_MS };
}

/** true si tiene suscripción vigente (active/trialing, vencimiento futuro) o trial vigente. */
export function isSubscribed(profile) {
  const status = profile?.subscription_status;
  if (status === "active" || status === "trialing") return true;
  const exp = profile?.subscription_expires_at ? new Date(profile.subscription_expires_at) : null;
  if (exp && exp > new Date()) return true;
  return getTrialInfo(profile).active;
}
