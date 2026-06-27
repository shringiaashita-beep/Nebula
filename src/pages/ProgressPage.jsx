import Leaderboard from "../components/Leaderboard";
import DailyQuests from "../components/DailyQuests";
import Achievements from "../components/Achievements";
import Analytics from "../components/Analytics";

function ProgressPage() {
  return (
    <div className="space-y-6">

      {/* Hero Section */}
      <div
        className="arc-card p-7 relative overflow-hidden"
        style={{ borderTop: "2px solid var(--arc-gold-500)" }}
      >
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="relative">
          <span className="arc-badge arc-badge-gold mb-3 inline-flex">Progress Telemetry</span>
          <h1 className="arc-font-display text-3xl font-bold arc-text-gradient mt-2">
            🏆 Progress Command Center
          </h1>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--arc-text-secondary)" }}>
            Track your growth, achievements, streaks and study performance.
          </p>
        </div>
      </div>

      <Analytics />

      <div className="grid lg:grid-cols-2 gap-6">
        <DailyQuests />
        <Leaderboard />
      </div>

      <Achievements />
    </div>
  );
}

export default ProgressPage;