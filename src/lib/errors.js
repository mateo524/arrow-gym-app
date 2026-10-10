// Traduce errores comunes de Supabase/red a mensajes claros en español.
const RULES = [
  [/invalid login credentials|invalid_credentials/i, "Email o contraseña incorrectos"],
  [/email not confirmed|email_not_confirmed/i, "Confirmá tu email antes de ingresar. Revisá tu casilla."],
  [/user already registered|already been registered|user_already_exists/i, "Ya existe una cuenta con ese email. Probá ingresar."],
  [/password should be at least|weak_password|password is too short/i, "La contraseña es muy corta o poco segura. Probá con una más larga."],
  [/unable to validate email|invalid format|valid email|email_address_invalid/i, "El email no parece válido. Revisalo."],
  [/rate limit|too many requests|over_email_send_rate_limit|over_request_rate_limit|\b429\b/i, "Hiciste demasiados intentos. Esperá un momento y probá de nuevo."],
  [/jwt expired|session.*(expired|not found)|refresh_token_not_found|invalid refresh token/i, "Tu sesión venció. Ingresá de nuevo."],
  [/new password should be different|same_password/i, "La nueva contraseña tiene que ser distinta de la actual."],
  [/timeout|timed out|aborterror|\b504\b|\b408\b/i, "Tardó demasiado. Probá de nuevo."],
  [/failed to fetch|networkerror|network request failed|load failed|offline|err_internet/i, "Sin conexión — revisá tu internet y probá de nuevo."],
  [/\b5\d\d\b|internal server error|service unavailable/i, "Hubo un problema en el servidor. Probá de nuevo en unos minutos."],
];

export function friendlyError(error) {
  const raw = typeof error === "string" ? error : (error?.message || error?.error_description || error?.code || "");
  if (!raw) return "Algo salió mal. Probá de nuevo.";
  const hay = `${raw} ${error?.code || ""} ${error?.name || ""}`;
  for (const [re, msg] of RULES) if (re.test(hay)) return msg;
  return "Algo salió mal. Probá de nuevo.";
}
