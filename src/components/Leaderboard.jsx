import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

function Leaderboard() {
  const [users, setUsers] =
    useState([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard =
    async () => {
      const { data, error } =
        await supabase
          .from("profiles")
          .select("*")
          .order("xp", {
            ascending: false,
          });

      if (error) {
        console.log(error);
        return;
      }

      setUsers(data || []);
    };

  return (
    <div className="bg-white p-6 rounded-2xl shadow mb-6">
      <h2 className="text-2xl font-bold mb-4">
        🏆 Leaderboard
      </h2>

      {users.map(
        (user, index) => (
          <div
            key={user.id}
            className="flex justify-between items-center border-b py-3"
          >
            <div className="font-semibold">
              {index === 0 &&
                "🥇 "}
              {index === 1 &&
                "🥈 "}
              {index === 2 &&
                "🥉 "}

              {user.username ||
                "Unknown"}
            </div>

            <div>
              {user.xp} XP
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default Leaderboard;