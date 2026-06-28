import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

const MEDAL = ["🥇", "🥈", "🥉"];
const MEDAL_STYLE = [
  { border: "rgba(212,175,55,0.5)",  bg: "rgba(212,175,55,0.08)"  },
  { border: "rgba(148,163,184,0.4)", bg: "rgba(148,163,184,0.06)" },
  { border: "rgba(180,110,60,0.4)",  bg: "rgba(180,110,60,0.06)"  },
];

function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => { fetchLeaderboard(); }, []);

  // ── Supabase fetch untouched ────────────────────────────────
  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from("profiles").select("*").order("xp", { ascending: false });
    if (error) { console.error("Leaderboard fetch error:", error); return; }
    setUsers(data || []);
  };

  return (
    <div className="arc-card p-6 space-y-5">
      {/* Header */}
      <div>
        <h2 className="arc-font-display text-2xl font-bold arc-text-gradient">
          🏆 Leaderboard
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--arc-text-secondary)" }}>
          Top performers ranked by XP
        </p>
      </div>

      {/* Podium top 3 */}
      {users.length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          {users.slice(0, 3).map((user, i) => (
            <div
              key={user.id}
              className="text-center p-4 rounded-xl"
              style={{
                background: MEDAL_STYLE[i].bg,
                border: `1px solid ${MEDAL_STYLE[i].border}`,
              }}
            >
              <div className="text-3xl mb-1">{MEDAL[i]}</div>
              <p className="font-bold text-sm truncate" style={{ color: "var(--arc-text-primary)" }}>
                {user.username || "—"}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--arc-gold-400)" }}>
                {user.xp} XP
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Full rank list */}
      <div className="space-y-2">
        {users.map((user, index) => (
          <div
            key={user.id}
            className="flex items-center justify-between px-4 py-3 rounded-xl transition-all"
            style={{
              background: "var(--arc-bg-elevated)",
              border: "1px solid var(--arc-border)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--arc-border)";
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                style={{
                  background: index < 3 ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.05)",
                  color: index < 3 ? "var(--arc-gold-400)" : "var(--arc-text-muted)",
                  border: `1px solid ${index < 3 ? "rgba(212,175,55,0.2)" : "var(--arc-border)"}`,
                }}
              >
                #{index + 1}
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--arc-text-primary)" }}>
                  {user.username || "Unknown"}
                </p>
                <p className="text-xs" style={{ color: "var(--arc-text-muted)" }}>Rank #{index + 1}</p>
              </div>
            </div>
            <span
              className="text-xs font-bold px-3 py-1 rounded-lg"
              style={{
                background: "rgba(212,175,55,0.08)",
                color: "var(--arc-gold-400)",
                border: "1px solid rgba(212,175,55,0.15)",
              }}
            >
              ⭐ {user.xp} XP
            </span>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-sm text-center py-6" style={{ color: "var(--arc-text-muted)" }}>
            No leaderboard data yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;