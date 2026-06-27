import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import supabase from "../lib/supabase";
import { ThemeContext } from "../context/ThemeContext";

import DashboardHome from "./DashboardHome";
import SubjectsPage from "./SubjectsPage";
import PlannerPage from "./PlannerPage";
import ProgressPage from "./ProgressPage";
import PYQPage from "./PYQPage";

// ── Sidebar navigation config ──────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard",  icon: "⬡" },
  { id: "subjects",  label: "Subjects",   icon: "◈" },
  { id: "planner",   label: "Planner",    icon: "◷" },
  { id: "progress",  label: "Progress",   icon: "◉" },
  { id: "pyq",       label: "PYQ Hub",    icon: "◎" },
];

function Dashboard() {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  // ── Auth & profile bootstrap (unchanged) ─────────────────────
  useEffect(() => {
    createProfile();
    createStreak();
  }, []);

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
  };

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
              <span>{label}</span>

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

          {/* Logout ─────────────────────────────────────────── */}
          <button
            onClick={handleLogout}
            className="arc-btn-ghost w-full text-left px-4 py-2.5 text-sm"
          >
            ⇠ Sign Out
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════
          MAIN CONTENT AREA
          ════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">

        {/* ── Top bar (mobile hamburger + page title) ───────── */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-5 py-4"
          style={{
            background: "var(--arc-bg-surface)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid var(--arc-border)",
          }}
        >
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden arc-btn-ghost px-3 py-2 text-sm"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Open navigation"
          >
            ☰
          </button>

          {/* Page title */}
          <div className="flex items-center gap-3">
            <h2
              className="arc-font-display text-lg font-semibold arc-text-gradient hidden sm:block"
            >
              {PAGE_TITLES[activePage] || "Nebula"}
            </h2>
          </div>

          {/* Gold accent dot — decorative */}
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "var(--arc-gold-400)" }}
            title="Live"
          />
        </header>

        {/* ── Page content ─────────────────────────────────── */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
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
        </main>
      </div>

    </div>
  );
}

export default Dashboard;