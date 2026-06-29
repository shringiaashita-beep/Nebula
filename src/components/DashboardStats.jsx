import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

function DashboardStats() {
  const [stats, setStats] = useState({
    subjects: 0,
    exams: 0,
    plans: 0,
    completed: 0,
    streak: 0,
  });
  const [profile, setProfile] = useState(null);
  const [quests, setQuests] = useState([]);
  const [claimedQuests, setClaimedQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Profile & Streaks
      const { data: profileData } = await supabase
        .from("profiles").select("*").eq("id", user.id).single();
      setProfile(profileData);

      const { data: streakData } = await supabase
        .from("user_streaks").select("*").eq("user_id", user.id).single();

      // 2. Fetch Stats counts
      const { data: subjects } = await supabase.from("subjects").select("*").eq("user_id", user.id);
      const { data: exams }    = await supabase.from("exams").select("*").eq("user_id", user.id);
      const { data: plans }    = await supabase.from("study_plans").select("*").eq("user_id", user.id);
      const { data: sessions } = await supabase.from("study_sessions").select("*").eq("user_id", user.id);

      const completed   = plans?.filter((p) => p.completed).length || 0;
      const streakCount = streakData?.streak_count || 0;

      setStats({
        subjects: subjects?.length || 0,
        exams:    exams?.length    || 0,
        plans:    plans?.length    || 0,
        completed,
        streak: streakCount,
      });

      // 3. Fetch Daily Quests
      const { data: questList } = await supabase.from("daily_quests").select("*");
      setQuests(questList || []);

      const { data: userQuests } = await supabase
        .from("user_quests").select("quest_id").eq("user_id", user.id);
      setClaimedQuests(userQuests?.map((q) => q.quest_id) || []);

    } catch (error) {
      console.error("Error loading dashboard metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalProgress = stats.plans === 0 ? 0 : Math.round((stats.completed / stats.plans) * 100);

  // ── Metric card config ──────────────────────────────────────
  const METRICS = [
    { label: "Tracked Subjects", value: stats.subjects, sub: "subjects linked",  icon: "◈" },
    { label: "Upcoming Exams",   value: stats.exams,    sub: "exams logged",     icon: "🔥" },
    { label: "Study Plans",      value: stats.plans,    sub: "plans active",     icon: "◷" },
    { label: "Study Streak",     value: stats.streak,   sub: "days active",      icon: "⚡" },
  ];

  if (loading) {
    return (
      <div className="animate-pulse space-y-5">
        <div className="h-36 rounded-2xl" style={{ background: "var(--arc-bg-surface)" }} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl" style={{ background: "var(--arc-bg-surface)" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── Hero banner ──────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl p-5 sm:p-7"
        style={{
          background: "var(--arc-bg-surface)",
          border: "1px solid var(--arc-border)",
          borderTop: "2px solid var(--arc-gold-500)",
        }}
      >
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />

        <div className="relative">
          <span
            className="arc-badge arc-badge-gold mb-3 inline-flex"
          >
            System Link Established
          </span>
          <h2 className="arc-font-display text-2xl font-bold arc-text-gradient mt-2">
            Welcome Back,{" "}
            <span className="arc-text-gold">{profile?.username || "Aspirant"}</span>
          </h2>
          <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "var(--arc-text-secondary)" }}>
            Focus on today's quests to earn XP and level up your rank.
          </p>

          {/* Plan completion bar */}
          <div className="mt-5 max-w-md">
            <div className="flex justify-between text-xs mb-1.5 font-medium"
              style={{ color: "var(--arc-text-secondary)" }}>
              <span>Core Study Plan Completion</span>
              <span style={{ color: "var(--arc-gold-400)" }}>{totalProgress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.05)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${totalProgress}%`,
                  background: "linear-gradient(to right, var(--arc-gold-500), var(--arc-gold-400))",
                  boxShadow: "0 0 8px rgba(212,175,55,0.35)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Metric pill row ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {METRICS.map(({ label, value, sub, icon }) => (
          <div
            key={label}
            className="arc-card p-6 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "var(--arc-text-muted)" }}>
                {label}
              </span>
              <span className="text-base" style={{ color: "var(--arc-gold-400)" }}>{icon}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black" style={{ color: "var(--arc-text-hero)" }}>
                {value}
              </span>
              <span className="text-xs font-medium" style={{ color: "var(--arc-text-muted)" }}>
                {sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quests & Rank ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quests list */}
        <div className="lg:col-span-2 arc-card p-6">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="arc-font-display text-lg font-bold arc-text-gradient">
                🎯 Today's Quests
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--arc-text-muted)" }}>
                Telemetry targets synced from Mission Control
              </p>
            </div>
            <span className="arc-badge arc-badge-success">
              +{quests.reduce((sum, q) => sum + (claimedQuests.includes(q.id) ? 0 : q.reward_xp), 0)} XP
            </span>
          </div>

          <div className="space-y-2.5">
            {quests.length > 0 ? (
              quests.map((quest) => {
                const isDone = claimedQuests.includes(quest.id);
                return (
                  <div
                    key={quest.id}
                    className="flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-300"
                    style={{
                      background: isDone
                        ? "rgba(16, 185, 129, 0.02)"
                        : "rgba(212, 175, 55, 0.03)",
                      border: isDone
                        ? "1px solid rgba(16, 185, 129, 0.15)"
                        : "1px solid rgba(212, 175, 55, 0.12)",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                        style={{
                          background: isDone ? "rgba(16, 185, 129, 0.1)" : "rgba(212, 175, 55, 0.1)",
                          color: isDone ? "var(--arc-success)" : "var(--arc-gold-400)",
                          border: isDone ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid rgba(212, 175, 55, 0.2)",
                        }}
                      >
                        {isDone ? "✓" : "⚡"}
                      </span>
                      <div>
                        <p className="font-semibold text-sm"
                          style={{ color: isDone ? "var(--arc-text-secondary)" : "var(--arc-text-primary)" }}>
                          {quest.title}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--arc-gold-400)", opacity: isDone ? 0.6 : 1 }}>
                          Reward: +{quest.reward_xp} XP
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded"
                      style={{
                        background: isDone ? "rgba(16, 185, 129, 0.1)" : "rgba(212, 175, 55, 0.05)",
                        color: isDone ? "var(--arc-success)" : "var(--arc-text-secondary)",
                      }}>
                      {isDone ? "SUCCESS" : "ACTIVE"}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm" style={{ color: "var(--arc-text-muted)" }}>
                No active quests for today.
              </p>
            )}
          </div>
        </div>

        {/* Command Rank */}
        <div className="arc-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="arc-font-display text-lg font-bold arc-text-gradient">
              🎖️ Command Rank
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--arc-text-muted)" }}>
              Telemetry evaluation badge
            </p>
            <div className="mt-6 text-center">
              <span className="text-6xl block">🛡️</span>
              <h4 className="arc-font-display text-2xl font-bold arc-text-gold mt-3">
                Level {profile?.level || 1}
              </h4>
              <p className="text-xs mt-1" style={{ color: "var(--arc-text-secondary)" }}>
                {profile?.xp || 0} Total XP Accumulated
              </p>
            </div>
          </div>

          <div className="mt-6 pt-5" style={{ borderTop: "1px solid var(--arc-border)" }}>
            <div className="flex justify-between text-xs mb-1.5 font-medium"
              style={{ color: "var(--arc-text-secondary)" }}>
              <span>Next Command Tier</span>
              <span style={{ color: "var(--arc-gold-400)" }}>{(profile?.xp || 0) % 100} / 100 XP</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.05)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(profile?.xp || 0) % 100}%`,
                  background: "linear-gradient(to right, var(--arc-gold-500), var(--arc-gold-400))",
                }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardStats;
