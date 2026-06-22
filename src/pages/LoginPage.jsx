import { useState, useEffect } from "react";
import useAuthStore from "../store/useAuthStore.js";
import { supabase } from "../lib/supabase.js";
import Icon from "../components/Icon.jsx";

const MAX_ATTEMPTS = 3;
const COOLDOWN_MS = 30_000;
const LS_KEY = "pulse-login-attempts";

function getRateLimit() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; }
}
function setRateLimit(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // "login" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [cooldownSecs, setCooldownSecs] = useState(0);
  const login = useAuthStore((s) => s.login);
  const authError = useAuthStore((s) => s.authError);

  // Tick down cooldown display
  useEffect(() => {
    const rl = getRateLimit();
    if (rl.lockedUntil && rl.lockedUntil > Date.now()) {
      const tick = () => {
        const left = Math.ceil((rl.lockedUntil - Date.now()) / 1000);
        if (left <= 0) { setCooldownSecs(0); } else { setCooldownSecs(left); setTimeout(tick, 1000); }
      };
      tick();
    }
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    const rl = getRateLimit();
    if (rl.lockedUntil && rl.lockedUntil > Date.now()) {
      const left = Math.ceil((rl.lockedUntil - Date.now()) / 1000);
      setCooldownSecs(left);
      return;
    }
    setSubmitting(true);
    await login(email.trim(), password);
    const error = useAuthStore.getState().authError;
    if (error) {
      const attempts = (rl.attempts || 0) + 1;
      if (attempts >= MAX_ATTEMPTS) {
        const lockedUntil = Date.now() + COOLDOWN_MS;
        setRateLimit({ attempts, lockedUntil });
        setCooldownSecs(Math.ceil(COOLDOWN_MS / 1000));
        setTimeout(() => { setRateLimit({}); setCooldownSecs(0); }, COOLDOWN_MS);
      } else {
        setRateLimit({ ...rl, attempts });
      }
    } else {
      setRateLimit({});
    }
    setSubmitting(false);
  }

  async function handleForgot(e) {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + "/reset-password",
    });
    setSubmitting(false);
    if (error) {
      setMsg("Error: " + error.message);
    } else {
      setMsg("✓ Te mandamos un email para restablecer tu contraseña.");
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          <Icon name="Zap" size={36} style={{ color:"var(--green)" }} />
        </div>
        <h1 className="login-title" style={{ background:"linear-gradient(135deg, var(--green), var(--cyan))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Loop</h1>
        <p style={{ textAlign:"center", fontSize:12, color:"var(--muted)", margin:"-8px 0 16px", letterSpacing:"0.12em", textTransform:"uppercase" }}>Track · Improve · Dominate</p>

        {mode === "login" ? (
          <>
            <p className="login-subtitle">Ingresá con tu cuenta para ver tu rutina personalizada</p>
            <form onSubmit={handleLogin} className="login-form">
              <div className="field-group">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com" autoComplete="email" inputMode="email" required />
              </div>
              <div className="field-group">
                <label htmlFor="password">Contraseña</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password" required />
              </div>

              {authError && (
                <div className="login-error">
                  <Icon name="AlertCircle" size={14} />
                  <span>{authError.includes("Invalid login") || authError.includes("invalid_credentials")
                    ? "Email o contraseña incorrectos" : authError}</span>
                </div>
              )}

              {cooldownSecs > 0 && (
                <div className="login-error">
                  <Icon name="Clock" size={14} />
                  <span>Demasiados intentos. Esperá {cooldownSecs}s.</span>
                </div>
              )}
              <button type="submit" className="primary big login-btn" disabled={submitting || !email || !password || cooldownSecs > 0}>
                {submitting ? "Ingresando…" : cooldownSecs > 0 ? `Bloqueado (${cooldownSecs}s)` : "Ingresar"}
              </button>

              <button type="button" className="ghost" style={{ width: "100%", fontSize: 13 }}
                onClick={() => { setMode("forgot"); setMsg(""); }}>
                Olvidé mi contraseña
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="login-subtitle">Ingresá tu email y te mandamos un link para restablecer tu contraseña</p>
            <form onSubmit={handleForgot} className="login-form">
              <div className="field-group">
                <label htmlFor="email-forgot">Email</label>
                <input id="email-forgot" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com" autoComplete="email" inputMode="email" required />
              </div>

              {msg && (
                <div className={msg.startsWith("✓") ? "success-msg" : "login-error"}>
                  <Icon name={msg.startsWith("✓") ? "CheckCircle" : "AlertCircle"} size={14} />
                  <span>{msg}</span>
                </div>
              )}

              <button type="submit" className="primary big login-btn" disabled={submitting || !email}>
                {submitting ? "Enviando…" : "Enviar email"}
              </button>

              <button type="button" className="ghost" style={{ width: "100%", fontSize: 13 }}
                onClick={() => { setMode("login"); setMsg(""); }}>
                ← Volver al login
              </button>
            </form>
          </>
        )}

        <p className="login-footer">¿No tenés cuenta? Tu entrenador la crea por vos.</p>
      </div>
    </div>
  );
}
