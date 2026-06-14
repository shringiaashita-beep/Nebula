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
  <div className="bg-white p-6 rounded-3xl shadow-xl mb-6">
    <h2 className="text-3xl font-black mb-6">
      📊 Analytics Dashboard
    </h2>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

      <div
        className="
        bg-gradient-to-r
        from-blue-500
        to-cyan-500
        text-white
        p-5
        rounded-2xl
        shadow-lg
      "
      >
        <p className="text-4xl font-bold">
          {stats.topics}
        </p>

        <p className="mt-2">
          📚 Total Topics
        </p>
      </div>

      <div
        className="
        bg-gradient-to-r
        from-green-500
        to-emerald-600
        text-white
        p-5
        rounded-2xl
        shadow-lg
      "
      >
        <p className="text-4xl font-bold">
          {stats.completed}
        </p>

        <p className="mt-2">
          ✅ Completed
        </p>
      </div>

      <div
        className="
        bg-gradient-to-r
        from-yellow-500
        to-orange-500
        text-white
        p-5
        rounded-2xl
        shadow-lg
      "
      >
        <p className="text-4xl font-bold">
          {stats.xp}
        </p>

        <p className="mt-2">
          ⭐ XP Earned
        </p>
      </div>

      <div
        className="
        bg-gradient-to-r
        from-violet-500
        to-purple-700
        text-white
        p-5
        rounded-2xl
        shadow-lg
      "
      >
        <p className="text-4xl font-bold">
          {stats.streak}
        </p>

        <p className="mt-2">
          🔥 Day Streak
        </p>
      </div>

    </div>

    <div className="mt-8">
      <h3 className="font-bold text-lg mb-3">
        Progress Overview
      </h3>

      <div className="w-full bg-slate-200 rounded-full h-5">
        <div
          className="
          h-5
          rounded-full
          bg-gradient-to-r
          from-green-500
          to-emerald-600
          transition-all
          duration-700
        "
          style={{
            width: `${
              stats.topics === 0
                ? 0
                : (
                    stats.completed /
                    stats.topics
                  ) *
                  100
            }%`,
          }}
        />
      </div>

      <p className="mt-2 text-sm text-slate-600">
        {stats.completed}/
        {stats.topics}
        {" "}
        topics completed
      </p>
    </div>
  </div>
);
}

export default Analytics;