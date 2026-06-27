import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

function Achievements() {
  const [badges, setBadges] = useState([]);

  useEffect(() => { fetchBadges(); }, []);

  // ── Supabase fetch untouched ────────────────────────────────
  const fetchBadges = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("user_badges").select("*").eq("user_id", user.id);
    if (error) { console.log(error); return; }
    setBadges(data || []);
  };

  return (
    <div className="arc-card p-6 space-y-5">
      {/* Header */}
      <div>
        <h2 className="arc-font-display text-2xl font-bold arc-text-gradient">
          🏅 Achievements
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--arc-text-secondary)" }}>
          Badges earned through mastery and consistency
        </p>
      </div>

      {badges.length === 0 ? (
        <div
          className="text-center py-10 rounded-xl"
          style={{
            background: "rgba(212,175,55,0.04)",
            border: "1px dashed rgba(212,175,55,0.15)",
          }}
        >
          <p className="text-3xl mb-2">🚀</p>
          <p className="text-sm font-medium" style={{ color: "var(--arc-text-secondary)" }}>
            Complete challenges to unlock achievements
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="p-5 rounded-xl transition-all"
              style={{
                background: "rgba(212,175,55,0.06)",
                border: "1px solid rgba(212,175,55,0.2)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.45)";
                e.currentTarget.style.boxShadow = "0 0 20px rgba(212,175,55,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="font-bold text-sm" style={{ color: "var(--arc-text-primary)" }}>
                {badge.badge_name}
              </h3>
              <p className="text-xs mt-1" style={{ color: "var(--arc-gold-400)" }}>
                Achievement Unlocked
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Achievements;