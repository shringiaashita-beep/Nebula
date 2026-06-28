import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

function DailyQuests() {
  const [quests, setQuests]   = useState([]);
  const [claimed, setClaimed] = useState([]);
  const [toast, setToast]     = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchQuests();
    fetchClaimedQuests();
  }, []);

  // ── All Supabase logic untouched ────────────────────────────
  const fetchQuests = async () => {
    const { data, error } = await supabase.from("daily_quests").select("*");
    if (error) { console.error("DailyQuests fetch error:", error); return; }
    setQuests(data || []);
  };

  const fetchClaimedQuests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("user_quests").select("quest_id").eq("user_id", user.id);
    setClaimed(data?.map((q) => q.quest_id) || []);
  };

  const claimReward = async (quest) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (claimed.includes(quest.id)) {
      showToast("Already claimed!", "warning");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles").select("*").eq("id", user.id).single();

    const currentXP = profile?.xp || 0;
    const newXP     = currentXP + quest.reward_xp;
    let newLevel = 1;
    if (newXP >= 1000) newLevel = 5;
    else if (newXP >= 500) newLevel = 4;
    else if (newXP >= 250) newLevel = 3;
    else if (newXP >= 100) newLevel = 2;

    await supabase.from("profiles").update({ xp: newXP, level: newLevel }).eq("id", user.id);

    const { error: questError } = await supabase.from("user_quests").insert([{
      user_id: user.id,
      quest_id: quest.id,
      completed: true,
      completed_at: new Date(),
    }]);
    if (questError) {
      console.error("QUEST ERROR:", questError);
    }

    setClaimed((prev) => [...prev, quest.id]);
    showToast(`🎉 Reward Claimed! +${quest.reward_xp} XP`, "success");
  };

  return (
    <div className="arc-card p-6 space-y-5 relative">
      {/* Toast notification */}
      {toast && (
        <div
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all"
          style={{
            background: toast.type === "success"
              ? "rgba(16,185,129,0.15)"
              : "rgba(212,175,55,0.15)",
            border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.4)" : "rgba(212,175,55,0.4)"}`,
            color: toast.type === "success" ? "var(--arc-success)" : "var(--arc-gold-400)",
            backdropFilter: "blur(12px)",
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="arc-font-display text-2xl font-bold arc-text-gradient">
          🎯 Daily Missions
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--arc-text-secondary)" }}>
          Complete quests to earn XP and level up
        </p>
      </div>

      {/* Quest list */}
      <div className="space-y-3">
        {quests.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: "var(--arc-text-muted)" }}>
            No active missions today.
          </p>
        ) : (
          quests.map((quest) => {
            const isClaimed = claimed.includes(quest.id);
            return (
              <div
                key={quest.id}
                className="flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-300"
                style={{
                  background: isClaimed
                    ? "rgba(16, 185, 129, 0.02)"
                    : "rgba(212, 175, 55, 0.03)",
                  border: isClaimed
                    ? "1px solid rgba(16, 185, 129, 0.15)"
                    : "1px solid rgba(212, 175, 55, 0.12)",
                }}
              >
                <div className="flex items-center gap-4">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={{
                      background: isClaimed ? "rgba(16, 185, 129, 0.1)" : "rgba(212, 175, 55, 0.1)",
                      color: isClaimed ? "var(--arc-success)" : "var(--arc-gold-400)",
                      border: isClaimed ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid rgba(212, 175, 55, 0.2)",
                    }}
                  >
                    {isClaimed ? "✓" : "⚡"}
                  </span>
                  <div>
                    <h3
                      className="font-semibold text-sm"
                      style={{ color: isClaimed ? "var(--arc-text-secondary)" : "var(--arc-text-primary)" }}
                    >
                      {quest.title}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--arc-gold-400)", opacity: isClaimed ? 0.6 : 1 }}>
                      ⭐ Reward: {quest.reward_xp} XP
                    </p>
                  </div>
                </div>

                {isClaimed ? (
                  <span className="arc-badge arc-badge-success">✓ Claimed</span>
                ) : (
                  <button
                    onClick={() => claimReward(quest)}
                    className="arc-btn-gold px-4 py-1.5 text-xs rounded-lg"
                  >
                    Claim
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default DailyQuests;