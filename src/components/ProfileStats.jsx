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
    <div className="bg-white p-6 rounded-2xl shadow mb-6">
      <h2 className="text-2xl font-bold mb-4">
        Your Progress
      </h2>

      <p className="text-lg mb-2">
        ⭐ XP: {xp}
      </p>

      <p className="text-lg mb-4">
        {rank}
      </p>

      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className="bg-blue-600 h-4 rounded-full"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <p className="mt-2 text-sm">
        Progress: {xp}/{maxXP} XP
      </p>

      <p className="mt-2 font-semibold">
        Next Rank: {nextRank}
      </p>
    </div>
  );
}

export default ProfileStats;