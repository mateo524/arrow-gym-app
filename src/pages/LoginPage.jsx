import { useState } from "react";
import useAuthStore from "../store/useAuthStore.js";
import { supabase } from "../lib/supabase.js";
import Icon from "../components/Icon.jsx";

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // "login" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const login = useAuthStore((s) => s.login);
  const authError = useAuthStore((s) => s.authError);

  async function handleLogin(e) {
    e.preventDefault();
    setSubmitting(true);
    await login(email.trim(), password);
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
          <Icon name="Zap" size={36} />
        </div>
        <h1 className="login-title">Pulse</h1>

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

              <button type="submit" className="primary big login-btn" disabled={submitting || !email || !password}>
                {submitting ? "Ingresando…" : "Ingresar"}
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
