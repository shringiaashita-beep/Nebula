import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

function Analytics() {
  const [stats, setStats] = useState({
    topics: 0, completed: 0, xp: 0, streak: 0,
  });

  useEffect(() => { fetchStats(); }, []);

  // ── All Supabase fetches untouched ──────────────────────────
  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: topics }  = await supabase.from("topics").select("*").eq("user_id", user.id);
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    const { data: streak }  = await supabase.from("user_streaks").select("*").eq("user_id", user.id).single();

    setStats({
      topics:    topics?.length || 0,
      completed: topics?.filter((t) => t.is_completed).length || 0,
      xp:        profile?.xp   || 0,
      streak:    streak?.streak_count || 0,
    });
  };

  const completionPct = stats.topics === 0 ? 0 : Math.round((stats.completed / stats.topics) * 100);

  const METRICS = [
    { label: "Total Topics", value: stats.topics,    icon: "📚" },
    { label: "Completed",    value: stats.completed, icon: "✓"  },
    { label: "XP Earned",    value: stats.xp,        icon: "⭐" },
    { label: "Day Streak",   value: stats.streak,    icon: "🔥" },
  ];

  return (
    <div className="arc-card p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="arc-font-display text-2xl font-bold arc-text-gradient">
          📊 Analytics Dashboard
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--arc-text-secondary)" }}>
          Live telemetry from your study sessions
        </p>
      </div>

      {/* Metric grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map(({ label, value, icon }) => (
          <div
            key={label}
            className="arc-card-elevated p-5 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "var(--arc-text-muted)" }}>
                {label}
              </span>
              <span style={{ color: "var(--arc-gold-400)" }}>{icon}</span>
            </div>
            <span className="text-3xl font-black" style={{ color: "var(--arc-text-hero)" }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Progress overview */}
      <div>
        <div className="flex justify-between text-xs mb-2 font-semibold"
          style={{ color: "var(--arc-text-secondary)" }}>
          <span>Topic Completion</span>
          <span style={{ color: "var(--arc-gold-400)" }}>{completionPct}%</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.05)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${completionPct}%`,
              background: "linear-gradient(to right, var(--arc-gold-500), var(--arc-gold-400))",
              boxShadow: "0 0 8px rgba(212,175,55,0.35)",
            }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--arc-text-muted)" }}>
          {stats.completed} / {stats.topics} topics completed
        </p>
      </div>
    </div>
  );
}

export default Analytics;