import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

function StreakCard() {
  const [streak, setStreak] =
    useState(0);

  useEffect(() => {
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } =
      await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .single();

    setStreak(
      data?.streak_count || 0
    );
  };

  return (
    <div className="bg-orange-100 p-6 rounded-2xl shadow mb-6">
      <h2 className="text-2xl font-bold">
        🔥 Study Streak
      </h2>

      <p className="text-xl mt-2">
        {streak} Days
      </p>
    </div>
  );
}

export default StreakCard;