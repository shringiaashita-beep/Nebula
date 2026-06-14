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
  <div
    className="
    bg-gradient-to-br
    from-orange-500
    via-red-500
    to-pink-600
    text-white
    p-6
    rounded-3xl
    shadow-2xl
    mb-6
  "
  >
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-3xl font-black">
          🔥 Study Streak
        </h2>

        <p className="mt-2 opacity-90">
          Keep your momentum alive
        </p>
      </div>

      <div className="text-right">
        <p className="text-5xl font-black">
          {streak}
        </p>

        <p className="text-sm">
          Days
        </p>
      </div>
    </div>

    <div className="mt-6">
      <div className="flex justify-between mb-2">
        <span>
          Progress to 30 Days
        </span>

        <span>
          {Math.min(
            Math.round(
              (streak / 30) * 100
            ),
            100
          )}
          %
        </span>
      </div>

      <div className="w-full bg-white/20 rounded-full h-4">
        <div
          className="
          bg-white
          h-4
          rounded-full
          transition-all
          duration-700
        "
          style={{
            width: `${Math.min(
              (streak / 30) * 100,
              100
            )}%`,
          }}
        />
      </div>
    </div>

    <div className="mt-5 p-4 bg-white/10 rounded-2xl">
      <p className="font-semibold">
        {streak >= 30
          ? "🏆 Legendary Consistency"
          : streak >= 14
          ? "🚀 On Fire"
          : streak >= 7
          ? "⚡ Building Momentum"
          : "🎯 Keep Going"}
      </p>
    </div>
  </div>
);}
export default StreakCard;