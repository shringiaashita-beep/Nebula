import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

function ProfileStats() {
  const [profile, setProfile] =
    useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(data);
  };

  if (!profile) return null;

  const xp = profile.xp || 0;

  let rank =
    "🏹 Beginner Scholar";

  let nextRank =
    "⚔️ Apprentice";

  let maxXP = 100;

  if (xp >= 1000) {
    rank = "💎 Legend";
    nextRank = "MAX";
    maxXP = 1000;
  } else if (xp >= 500) {
    rank = "👑 Master";
    nextRank = "💎 Legend";
    maxXP = 1000;
  } else if (xp >= 250) {
    rank = "🛡️ Warrior";
    nextRank = "👑 Master";
    maxXP = 500;
  } else if (xp >= 100) {
    rank = "⚔️ Apprentice";
    nextRank = "🛡️ Warrior";
    maxXP = 250;
  }

  const progress =
    Math.min(
      (xp / maxXP) * 100,
      100
    );

  return (
  <div
    className="
    bg-gradient-to-br
    from-violet-600
    via-purple-600
    to-indigo-700
    text-white
    p-8
    rounded-3xl
    shadow-2xl
    mb-6
  "
  >
    <div className="flex justify-between items-start">
      <div>
        <h2 className="text-4xl font-black mb-2">
          🚀 Your Journey
        </h2>

        <p className="text-xl opacity-90">
          {rank}
        </p>
      </div>

      <div className="text-right">
        <p className="text-4xl font-black">
          ⭐ {xp}
        </p>

        <p className="opacity-80">
          Total XP
        </p>
      </div>
    </div>

    <div className="mt-8">
      <div className="flex justify-between mb-2">
        <span className="font-semibold">
          Level Progress
        </span>

        <span>
          {Math.round(progress)}%
        </span>
      </div>

      <div className="w-full bg-white/20 rounded-full h-5">
        <div
          className="
          bg-white
          h-5
          rounded-full
          transition-all
          duration-700
        "
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <p className="mt-3">
        {xp}/{maxXP} XP
      </p>
    </div>

    <div className="mt-6 p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
      <p className="font-semibold">
        🎯 Next Rank
      </p>

      <p className="text-xl mt-1">
        {nextRank}
      </p>
    </div>
  </div>
);
}
export default ProfileStats;