import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import supabase from "../lib/supabase";
import { ThemeContext } from "../context/ThemeContext";
import { LANGUAGES } from "../config/languages";
import { useTranslation } from "react-i18next";

import DashboardHome from "./DashboardHome";
import SubjectsPage from "./SubjectsPage";
import PlannerPage from "./PlannerPage";
import ProgressPage from "./ProgressPage";
import PYQPage from "./PYQPage";
import SummaryPage from "./SummaryPage";
import ErrorBoundary from "../components/ErrorBoundary";

// ── Sidebar navigation config ──────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard",  icon: "⬡" },
  { id: "subjects",  label: "Subjects",   icon: "◈" },
  { id: "planner",   label: "Planner",    icon: "◷" },
  { id: "progress",  label: "Progress",   icon: "◉" },
  { id: "pyq",       label: "PYQ Hub",    icon: "◎" },
  { id: "summary",   label: "Summary",    icon: "📖" },
];

function Dashboard() {
  const { t } = useTranslation();
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [language, setLanguage] = useState("english");
  const [savingLang, setSavingLang] = useState(false);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const navigate = useNavigate();

  // ── Auth & profile bootstrap (unchanged) ─────────────────────
  useEffect(() => {
    createProfile();
    createStreak();
    fetchLanguagePreference();

    // Auto-hide the welcome banner after 2 minutes (120,000 ms)
    const bannerTimer = setTimeout(() => {
      setShowWelcomeBanner(false);
    }, 120000);
    return () => clearTimeout(bannerTimer);
  }, []);

  const fetchLanguagePreference = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("language_preference")
      .eq("id", user.id)
      .single();
    if (data?.language_preference) {
      setLanguage(data.language_preference.toLowerCase());
    }
  };

  const handleLanguageChange = async (newLang) => {
    setLanguage(newLang);
    import("i18next").then((i18n) => {
      i18n.default.changeLanguage(newLang);
    });
    setSavingLang(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ language_preference: newLang })
        .eq("id", user.id);
    }
    setSavingLang(false);
  };

  const createProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!data) {
      await supabase.from("profiles").insert([
        {
          id: user.id,
          username: user.email.split("@")[0],
          xp: 0,
          level: 1,
          language_preference: "english"
        },
      ]);
    }
  };

  const createStreak = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!data) {
      await supabase.from("user_streaks").insert([
        { user_id: user.id, streak_count: 0 },
      ]);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleNav = (id) => {
    setActivePage(id);
    setMobileOpen(false);
  };

  // ── Page title map ──────────────────────────────────────────
  const PAGE_TITLES = {
    dashboard: "Mission Control",
    subjects:  "My Subjects",
    planner:   "Study Planner",
    progress:  "Progress Report",
    pyq:       "PYQ Hub",
    summary:   "About Nebula",
  };

  // Bottom nav items (mobile only - 5 most used)
  const BOTTOM_NAV = [
    { id: "dashboard", icon: "⬡", label: "Home" },
    { id: "subjects",  icon: "◈", label: "Subjects" },
    { id: "pyq",       icon: "◎", label: "PYQ" },
    { id: "progress",  icon: "◉", label: "Progress" },
    { id: "summary",   icon: "📖", label: "Guide" },
  ];

  return (
    <div className="min-h-screen flex arc-spotlight">

      {/* ── Mobile overlay ───────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ════════════════════════════════════════════════════════
          SIDEBAR
          ════════════════════════════════════════════════════════ */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-40
          w-72 flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          background: "var(--arc-bg-surface)",
          borderRight: "1px solid var(--arc-border)",
        }}
      >
        {/* Brand ─────────────────────────────────────────────── */}
        <div className="px-6 py-7 border-b" style={{ borderColor: "var(--arc-border)" }}>
          <h1
            className="arc-font-display text-2xl font-bold arc-text-gold tracking-wide"
          >
            NEBULA
          </h1>
          <p className="text-xs mt-1 font-medium tracking-widest uppercase"
            style={{ color: "var(--arc-text-muted)" }}>
            Study Command Center
          </p>
        </div>

        {/* Nav items ─────────────────────────────────────────── */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              aria-current={activePage === id ? "page" : undefined}
              className={`arc-nav-item ${activePage === id ? "active" : ""}`}
            >
              <span className="text-base leading-none">{icon}</span>
              <span>{t("Navigation." + (id === 'pyq' ? 'PYQs' : id === 'progress' ? 'Analytics' : id === 'planner' ? 'Study Planner' : id.charAt(0).toUpperCase() + id.slice(1)))}</span>

              {/* Active gold indicator line */}
              {activePage === id && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--arc-gold-400)" }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Bottom section ─────────────────────────────────────── */}
        <div className="px-4 py-5 space-y-2 border-t flex flex-col gap-1" style={{ borderColor: "var(--arc-border)" }}>
          {/* Theme Toggle ─────────────────────────────────────── */}
          <button
            onClick={toggleDarkMode}
            className="arc-btn-ghost w-full text-left px-4 py-2 text-xs flex items-center justify-between"
          >
            <span>🌓 Theme / थीम</span>
            <span className="font-bold text-[10px] uppercase text-amber-500">
              {darkMode ? "Black / काला" : "White / सफेद"}
            </span>
          </button>

          {/* API Settings ─────────────────────────────────────── */}
          <button
            onClick={() => navigate("/settings")}
            className="arc-btn-ghost w-full text-left px-4 py-2 text-xs flex items-center gap-2 text-purple-400 hover:text-purple-300"
          >
            <span>⚙️</span> API Settings (BYOK)
          </button>

          {/* Logout ─────────────────────────────────────────── */}
          <button
            onClick={handleLogout}
            className="arc-btn-ghost w-full text-left px-4 py-2.5 text-sm"
          >
            ⇠ {t("Navigation.Logout")}
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════
          MAIN CONTENT AREA
          ════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">

        {/* ── Top bar ───────── */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 lg:px-5 lg:py-4"
          style={{
            background: "var(--arc-bg-surface)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid var(--arc-border)",
          }}
        >
          {/* Mobile hamburger (shows sidebar on lg+; on mobile we use bottom nav but keep it for sidebar access) */}
          <button
            className="lg:hidden arc-btn-ghost px-2.5 py-1.5 text-base"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Open navigation"
          >
            ☰
          </button>

          {/* Page title */}
          <h2 className="arc-font-display text-sm sm:text-lg font-semibold arc-text-gradient truncate max-w-[140px] sm:max-w-none">
            {PAGE_TITLES[activePage] || "Nebula"}
          </h2>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Quick Language Selector */}
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={savingLang}
              className="bg-transparent text-xs sm:text-sm border border-gray-600 rounded-md px-1.5 sm:px-2 py-1 outline-none cursor-pointer focus:border-blue-500 transition-colors max-w-[90px] sm:max-w-none"
              style={{ color: "var(--arc-text-primary)", background: "var(--arc-bg-base)" }}
              title="AI Content Language"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>{lang.label}</option>
              ))}
            </select>
            
            <div className="w-2 h-2 rounded-full animate-pulse hidden sm:block" style={{ background: "var(--arc-gold-400)" }} title="Live" />
          </div>
        </header>

        {/* ── Page content ─────────────────────────────────── */}
        {/* pb-20 on mobile = space above bottom nav bar */}
        <main className="flex-1 p-3 sm:p-4 md:p-8 overflow-x-hidden pb-24 lg:pb-8">
          
          {showWelcomeBanner && (
            <div className="mb-6 p-4 rounded-xl border flex justify-between items-start animate-fade-in" 
                 style={{ 
                   background: "linear-gradient(to right, rgba(95,39,205,0.1), rgba(212,175,55,0.1))",
                   borderColor: "rgba(212,175,55,0.5)",
                   boxShadow: "0 0 20px rgba(212,175,55,0.15)"
                 }}>
              <div className="flex gap-4">
                <span className="text-3xl mt-1">✨</span>
                <div>
                  <h3 className="font-bold text-lg mb-1.5" style={{ color: "var(--arc-gold-400)" }}>
                    Welcome to Nebula Study Command Center
                  </h3>
                  <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--arc-text-primary)" }}>
                    If you want to generate Notes and other AI study material, please add your API Key according to the process written in the <button onClick={() => navigate("/settings")} className="underline font-bold text-purple-400 hover:text-purple-300">API Settings</button> section.
                    <br/>
                    If you just want to practice, you can move directly to the <button onClick={() => handleNav("pyq")} className="underline font-bold text-emerald-400 hover:text-emerald-300">PYQ Hub</button> and solve questions freely without needing an API key!
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowWelcomeBanner(false)} 
                className="text-gray-400 hover:text-white font-black ml-4 px-2 py-1 bg-black/20 rounded-md transition-colors"
                title="Dismiss"
              >
                ✖
              </button>
            </div>
          )}

          <ErrorBoundary>
            {activePage === "dashboard" && (
              <DashboardHome
                selectedSubject={selectedSubject}
                setSelectedSubject={setSelectedSubject}
              />
            )}
            {activePage === "subjects" && (
              <SubjectsPage selectedSubject={selectedSubject} />
            )}
            {activePage === "planner" && <PlannerPage />}
            {activePage === "progress" && <ProgressPage />}
            {activePage === "pyq"      && <PYQPage />}
            {activePage === "summary"  && <SummaryPage />}
          </ErrorBoundary>
        </main>
      </div>

      {/* ════════════════════════════════════════════════════════
          MOBILE BOTTOM NAVIGATION BAR (hidden on lg+)
          ════════════════════════════════════════════════════════ */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden flex items-center justify-around border-t"
        style={{
          background: "var(--arc-bg-surface)",
          borderColor: "var(--arc-border)",
          backdropFilter: "blur(20px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {BOTTOM_NAV.map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => handleNav(id)}
            className="flex flex-col items-center justify-center gap-0.5 py-2.5 px-3 flex-1 transition-all duration-200"
            style={{
              color: activePage === id ? "var(--arc-gold-400)" : "var(--arc-text-muted)",
              fontSize: "10px",
            }}
          >
            <span className="text-lg leading-none" style={{ filter: activePage === id ? "drop-shadow(0 0 6px rgba(212,175,55,0.6))" : "none" }}>{icon}</span>
            <span className="font-semibold tracking-wide" style={{ fontSize: "9px" }}>{label}</span>
            {activePage === id && (
              <span className="absolute bottom-0 w-8 h-0.5 rounded-full" style={{ background: "var(--arc-gold-400)" }} />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default Dashboard;