import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

// XP Rank calculation — logic untouched
function getRankInfo(xp) {
  if (xp >= 1000) return { rank: "💎 Legend",           nextRank: "MAX",        maxXP: 1000 };
  if (xp >= 500)  return { rank: "👑 Master",           nextRank: "💎 Legend",  maxXP: 1000 };
  if (xp >= 250)  return { rank: "🛡️ Warrior",          nextRank: "👑 Master",  maxXP: 500  };
  if (xp >= 100)  return { rank: "⚔️ Apprentice",       nextRank: "🛡️ Warrior", maxXP: 250  };
  return           { rank: "🏹 Beginner Scholar",       nextRank: "⚔️ Apprentice", maxXP: 100 };
}

function ProfileStats() {
  const [profile, setProfile] = useState(null);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    setProfile(data);
  };

  if (!profile) return null;

  const xp = profile.xp || 0;
  const { rank, nextRank, maxXP } = getRankInfo(xp);
  const progress = Math.min((xp / maxXP) * 100, 100);

  return (
    <div
      className="arc-card p-6 flex flex-col gap-5"
      style={{ borderTop: "2px solid var(--arc-gold-500)" }}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase mb-1"
            style={{ color: "var(--arc-text-muted)" }}>
            YOUR JOURNEY
          </p>
          <h2 className="arc-font-display text-2xl font-bold arc-text-gradient">
            🚀 {profile.username || "Aspirant"}
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--arc-text-secondary)" }}>
            {rank}
          </p>
        </div>
        <div className="text-right">
          <p className="arc-text-gold text-3xl font-black arc-font-display">
            {xp}
          </p>
          <p className="text-xs tracking-wider uppercase mt-0.5"
            style={{ color: "var(--arc-text-muted)" }}>
            Total XP
          </p>
        </div>
      </div>

      {/* Level Progress Bar */}
      <div>
        <div className="flex justify-between text-xs mb-2 font-medium"
          style={{ color: "var(--arc-text-secondary)" }}>
          <span>Level Progress</span>
          <span style={{ color: "var(--arc-gold-400)" }}>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.05)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(to right, var(--arc-gold-500), var(--arc-gold-400))",
              boxShadow: "0 0 8px rgba(212,175,55,0.4)",
            }}
          />
        </div>
        <p className="text-xs mt-1.5" style={{ color: "var(--arc-text-muted)" }}>
          {xp} / {maxXP} XP
        </p>
      </div>

      {/* Next Rank indicator */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-xl"
        style={{
          background: "rgba(212,175,55,0.06)",
          border: "1px solid rgba(212,175,55,0.15)",
        }}
      >
        <span className="text-xs font-semibold" style={{ color: "var(--arc-text-muted)" }}>
          NEXT RANK
        </span>
        <span className="text-sm font-bold" style={{ color: "var(--arc-gold-400)" }}>
          {nextRank === "MAX" ? "👑 Maximum Level" : nextRank}
        </span>
      </div>
    </div>
  );
}

export default ProfileStats;