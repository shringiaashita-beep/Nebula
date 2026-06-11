import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

function Analytics() {
  const [stats, setStats] =
    useState({
      topics: 0,
      completed: 0,
      xp: 0,
      streak: 0,
    });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: topics } =
      await supabase
        .from("topics")
        .select("*")
        .eq("user_id", user.id);

    const { data: profile } =
      await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    const { data: streak } =
      await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .single();

    setStats({
      topics:
        topics?.length || 0,
      completed:
        topics?.filter(
          (t) => t.is_completed
        ).length || 0,
      xp:
        profile?.xp || 0,
      streak:
        streak?.streak_count || 0,
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow mb-6">
      <h2 className="text-2xl font-bold mb-4">
        📊 Analytics
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          📚 Topics:
          {stats.topics}
        </div>

        <div>
          ✅ Completed:
          {stats.completed}
        </div>

        <div>
          ⭐ XP:
          {stats.xp}
        </div>

        <div>
          🔥 Streak:
          {stats.streak}
        </div>
      </div>
    </div>
  );
}

export default Analytics;