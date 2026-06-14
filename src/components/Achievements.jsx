import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

function Achievements() {
  const [badges, setBadges] =
    useState([]);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } =
      await supabase
        .from("user_badges")
        .select("*")
        .eq(
          "user_id",
          user.id
        );

    if (error) {
      console.log(error);
      return;
    }

    setBadges(data || []);
  };

 return (
  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-3xl shadow-xl mb-6 border border-yellow-200">
    <h2 className="text-3xl font-black mb-6">
      🏅 Achievements
    </h2>

    {badges.length === 0 ? (
      <div className="bg-white p-6 rounded-2xl text-center shadow">
        <p className="text-lg">
          🚀 Complete challenges to unlock achievements
        </p>
      </div>
    ) : (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="
            bg-gradient-to-br
            from-yellow-400
            to-orange-500
            text-white
            rounded-2xl
            p-5
            shadow-xl
            hover:scale-105
            transition-all
            duration-300
          "
          >
            <div className="text-4xl mb-3">
              🏆
            </div>

            <h3 className="text-xl font-bold">
              {badge.badge_name}
            </h3>

            <p className="text-sm opacity-90 mt-2">
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