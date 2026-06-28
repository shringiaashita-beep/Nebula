import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";
import { useTranslation } from "react-i18next";

function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }
    if (!agreeTerms) {
      setErrorMsg("You must agree to the Terms & Conditions to register.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      setSuccessMsg("Account created! Redirecting to login…");
      setTimeout(() => navigate("/"), 1500);
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
        className="absolute top-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
          transform: "translateY(-50%)",
        }}
      />
      <div
        className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full pointer-events-none"
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
          padding: "2.5rem",
        }}
      >
        {/* Brand header */}
        <div className="text-center mb-8">
          <h1 className="arc-font-display text-4xl font-bold arc-text-gold tracking-wide">
            NEBULA
          </h1>
          <p
            className="text-xs mt-2 tracking-widest uppercase font-semibold"
            style={{ color: "var(--arc-text-muted)" }}
          >
            Study Command Center
          </p>
          <div
            className="mt-4 h-px mx-auto w-16"
            style={{ background: "linear-gradient(to right, transparent, var(--arc-gold-500), transparent)" }}
          />
        </div>

        {/* Section label */}
        <p
          className="text-center text-sm font-medium mb-6"
          style={{ color: "var(--arc-text-secondary)" }}
        >
          {t("Auth.Register")}
        </p>

        {/* Error / Success banners */}
        {errorMsg && (
          <div className="arc-alert-error mb-5" role="alert">
            <span>⚠</span>
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="arc-alert-success mb-5" role="status">
            <span>✓</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label
              htmlFor="reg-name"
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--arc-text-secondary)" }}
            >
              Full Name
            </label>
            <input
              id="reg-name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="arc-input"
            />
          </div>

          <div>
            <label
              htmlFor="reg-email"
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--arc-text-secondary)" }}
            >
              {t("Auth.Email")}
            </label>
            <input
              id="reg-email"
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
              htmlFor="reg-password"
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--arc-text-secondary)" }}
            >
              {t("Auth.Password")}
            </label>
            <input
              id="reg-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="arc-input"
            />
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="flex items-start gap-2 pt-1 text-xs">
            <input
              id="reg-terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              disabled={loading}
              className="mt-0.5 rounded cursor-pointer accent-amber-500"
              required
            />
            <label htmlFor="reg-terms" style={{ color: "var(--arc-text-secondary)" }} className="cursor-pointer select-none">
              I agree to the{" "}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="underline font-bold text-amber-500 hover:text-amber-400 cursor-pointer bg-transparent border-none p-0 inline"
              >
                Terms & Conditions / नियम और शर्तें
              </button>
            </label>
          </div>

          <button
            type="submit"
            id="reg-submit"
            disabled={loading}
            className="arc-btn-gold w-full py-3.5 text-sm"
          >
            {loading ? t("Errors.Loading...") : t("Auth.Register")}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center mt-7 text-sm" style={{ color: "var(--arc-text-muted)" }}>
          Already have an account?{" "}
          <Link
            to="/"
            className="font-semibold transition-colors"
            style={{ color: "var(--arc-gold-400)" }}
            onMouseOver={(e) => (e.target.style.color = "var(--arc-gold-300)")}
            onMouseOut={(e) => (e.target.style.color = "var(--arc-gold-400)")}
          >
            {t("Auth.Sign In")} →
          </Link>
        </p>
      </div>

      {/* ── Terms & Conditions Modal ── */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div
            className="w-full max-w-lg rounded-2xl p-6 overflow-hidden flex flex-col max-h-[85vh] border"
            style={{
              background: "var(--arc-bg-surface)",
              borderColor: "var(--arc-border-gold)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.8), 0 0 32px var(--arc-gold-glow-lg)"
            }}
          >
            <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: "var(--arc-border)" }}>
              <h3 className="arc-font-display text-base font-bold arc-text-gold">
                📜 Terms & Conditions / नियम और शर्तें
              </h3>
              <button
                onClick={() => setShowTerms(false)}
                className="text-xs arc-btn-ghost px-2.5 py-1 rounded-lg"
              >
                ✕ Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto my-4 pr-1 text-xs space-y-3 text-justify leading-relaxed" style={{ color: "var(--arc-text-secondary)" }}>
              <p className="font-bold text-white">1. Platform Services / प्लेटफॉर्म सेवाएं</p>
              <p>Nebula Study Command Center provides AI tutoring, historical competitive examination questions (PYQs), study planner generators, and progress telemetry. By accessing or initializing a command node, you agree to comply with all guidelines.</p>
              
              <p className="font-bold text-white">2. Study Telemetry & Privacy / डेटा और गोपनीयता</p>
              <p>Your practice logs, streaks, and generated notes are private to you unless public options are explicitly enabled. All user data is processed securely through Supabase databases. We prioritize student credential confidentiality.</p>

              <p className="font-bold text-white">3. Acceptable Use / उचित उपयोग</p>
              <p>You agree not to bypass quiz security, reverse engineer question scrapers, or flood the API channels. Generative AI outputs are meant strictly for self-learning and examination prep assistance.</p>
              
              <p className="font-bold text-white">4. Telemetry Disclaimer / अस्वीकरण</p>
              <p>Examination questions are retrieved directly from official past paper repositories. While Nebula strives for correctness in mock grading, you are advised to verify answers against official state board answer keys.</p>
            </div>
            <div className="pt-3 border-t flex justify-end" style={{ borderColor: "var(--arc-border)" }}>
              <button
                onClick={() => setShowTerms(false)}
                className="arc-btn-gold text-xs px-5 py-2 rounded-xl"
              >
                I Understand / मैं समझता हूँ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;