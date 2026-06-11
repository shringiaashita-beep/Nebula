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
    <div className="bg-white p-6 rounded-2xl shadow mb-6">
      <h2 className="text-2xl font-bold mb-4">
        🏅 Achievements
      </h2>

      {badges.length === 0 ? (
        <p>
          No achievements yet
        </p>
      ) : (
        badges.map((badge) => (
          <div
            key={badge.id}
            className="border rounded-lg p-3 mb-2"
          >
            🏆 {badge.badge_name}
          </div>
        ))
      )}
    </div>
  );
}

export default Achievements;