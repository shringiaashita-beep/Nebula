import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

function StreakCard() {
  const [streak, setStreak] = useState(0);

  useEffect(() => { fetchStreak(); }, []);

  const fetchStreak = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", user.id)
      .single();
    setStreak(data?.streak_count || 0);
  };

  const streakPct = Math.min((streak / 30) * 100, 100);

  const statusLabel =
    streak >= 30 ? "🏆 Legendary Consistency" :
    streak >= 14 ? "🚀 On Fire"              :
    streak >= 7  ? "⚡ Building Momentum"    :
                   "🎯 Keep Going";

  return (
    <div
      className="arc-card p-6 flex flex-col gap-5"
      style={{ borderTop: "2px solid var(--arc-gold-500)" }}
    >
      {/* Header row */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase mb-1"
            style={{ color: "var(--arc-text-muted)" }}>
            STUDY STREAK
          </p>
          <h2 className="arc-font-display text-2xl font-bold arc-text-gradient">
            🔥 Study Streak
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--arc-text-secondary)" }}>
            Keep your momentum alive
          </p>
        </div>
        <div className="text-right">
          <p className="arc-text-gold text-4xl font-black arc-font-display">
            {streak}
          </p>
          <p className="text-xs tracking-wider uppercase mt-0.5"
            style={{ color: "var(--arc-text-muted)" }}>
            Days
          </p>
        </div>
      </div>

      {/* Progress to 30 days */}
      <div>
        <div className="flex justify-between text-xs mb-2 font-medium"
          style={{ color: "var(--arc-text-secondary)" }}>
          <span>Progress to 30 Days</span>
          <span style={{ color: "var(--arc-gold-400)" }}>{Math.round(streakPct)}%</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.05)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${streakPct}%`,
              background: "linear-gradient(to right, var(--arc-gold-500), var(--arc-gold-400))",
              boxShadow: "0 0 8px rgba(212,175,55,0.4)",
            }}
          />
        </div>
      </div>

      {/* Status label */}
      <button
        className="w-full text-sm font-semibold py-2.5 px-4 rounded-xl text-center transition-all"
        style={{
          background: "rgba(212,175,55,0.06)",
          border: "1px solid rgba(212,175,55,0.15)",
          color: "var(--arc-gold-400)",
        }}
      >
        {statusLabel}
      </button>
    </div>
  );
}

export default StreakCard;