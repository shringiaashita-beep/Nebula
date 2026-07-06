import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";
import { useTranslation } from "react-i18next";

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message);
        return;
      }
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="arc-spotlight min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

      {/* ── Ambient glow orbs ─────────────────────────────── */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(212,175,55,0.09) 0%, transparent 70%)",
          transform: "translateY(-50%)",
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)",
          transform: "translateY(40%)",
        }}
      />

      {/* ── Auth Card ─────────────────────────────────────── */}
      <div
        className="w-full max-w-md relative animate-fade-in"
        style={{
          background: "var(--arc-bg-surface)",
          border: "1px solid var(--arc-border-subtle)",
          borderTop: "2px solid var(--arc-gold-500)",
          borderRadius: "20px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(212,175,55,0.06)",
          padding: "clamp(1.25rem, 5vw, 2.5rem)",
        }}
      >
        {/* Brand header */}
        <div className="text-center mb-8">
          <h1
            className="arc-font-display text-4xl font-bold arc-text-gold tracking-wide"
          >
            NEBULA
          </h1>
          <p className="text-xs mt-2 tracking-widest uppercase font-semibold"
            style={{ color: "var(--arc-text-muted)" }}>
            Study Command Center
          </p>
          <div
            className="mt-4 h-px mx-auto w-16"
            style={{ background: "linear-gradient(to right, transparent, var(--arc-gold-500), transparent)" }}
          />
        </div>

        {/* Section label */}
        <p className="text-center text-sm font-medium mb-6"
          style={{ color: "var(--arc-text-secondary)" }}>
          {t("Auth.Sign In")}
        </p>

        {/* Error banner */}
        {errorMsg && (
          <div className="arc-alert-error mb-5" role="alert">
            <span>⚠</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--arc-text-secondary)" }}
            >
              {t("Auth.Email")}
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="arc-input"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--arc-text-secondary)" }}
            >
              {t("Auth.Password")}
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            className="arc-input"
          />
        </div>

        <button
          type="submit"
          id="login-submit"
          disabled={loading}
          className="arc-btn-gold w-full py-3.5 text-sm"
        >
          {loading ? t("Errors.Loading...") : t("Auth.Login")}
        </button>
        </form>

        {/* Register link */}
        <p className="text-center mt-7 text-sm" style={{ color: "var(--arc-text-muted)" }}>
          New to Nebula?{" "}
          <Link
            to="/register"
            className="font-semibold transition-colors"
            style={{ color: "var(--arc-gold-400)" }}
            onMouseOver={(e) => (e.target.style.color = "var(--arc-gold-300)")}
            onMouseOut={(e) => (e.target.style.color = "var(--arc-gold-400)")}
          >
            {t("Auth.Sign Up")} →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;