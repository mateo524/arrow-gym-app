import { useState } from "react";
import useAuthStore from "../store/useAuthStore.js";
import Icon from "../components/Icon.jsx";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const login = useAuthStore((s) => s.login);
  const authError = useAuthStore((s) => s.authError);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    await login(email.trim(), password);
    setSubmitting(false);
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          <Icon name="Zap" size={36} />
        </div>
        <h1 className="login-title">Arrow Gym</h1>
        <p className="login-subtitle">Ingresá con tu cuenta para ver tu rutina personalizada</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              inputMode="email"
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {authError && (
            <div className="login-error">
              <Icon name="AlertCircle" size={14} />
              <span>
                {authError.includes("Invalid login") || authError.includes("invalid_credentials")
                  ? "Email o contraseña incorrectos"
                  : authError}
              </span>
            </div>
          )}

          <button
            type="submit"
            className="primary big login-btn"
            disabled={submitting || !email || !password}
          >
            {submitting ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <p className="login-footer">
          ¿No tenés cuenta? Tu entrenador la crea por vos.
        </p>
      </div>
    </div>
  );
}
