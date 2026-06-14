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
  <div className="bg-white p-6 rounded-3xl shadow-xl mb-6">
    <h2 className="text-3xl font-black mb-6">
      🏆 Leaderboard
    </h2>

    {users.length >= 3 && (
      <div className="grid md:grid-cols-3 gap-4 mb-8">

        <div className="
          bg-gradient-to-br
          from-yellow-400
          to-yellow-600
          text-white
          p-5
          rounded-2xl
          shadow-xl
          text-center
        ">
          <div className="text-5xl mb-2">
            🥇
          </div>

          <h3 className="text-xl font-bold">
            {users[0]?.username}
          </h3>

          <p>
            {users[0]?.xp} XP
          </p>
        </div>

        <div className="
          bg-gradient-to-br
          from-slate-300
          to-slate-500
          text-white
          p-5
          rounded-2xl
          shadow-xl
          text-center
        ">
          <div className="text-5xl mb-2">
            🥈
          </div>

          <h3 className="text-xl font-bold">
            {users[1]?.username}
          </h3>

          <p>
            {users[1]?.xp} XP
          </p>
        </div>

        <div className="
          bg-gradient-to-br
          from-orange-400
          to-orange-700
          text-white
          p-5
          rounded-2xl
          shadow-xl
          text-center
        ">
          <div className="text-5xl mb-2">
            🥉
          </div>

          <h3 className="text-xl font-bold">
            {users[2]?.username}
          </h3>

          <p>
            {users[2]?.xp} XP
          </p>
        </div>

      </div>
    )}

    <div className="space-y-3">
      {users.map(
        (user, index) => (
          <div
            key={user.id}
            className="
            flex
            justify-between
            items-center
            bg-slate-50
            rounded-2xl
            p-4
            shadow
            hover:shadow-lg
            transition-all
          "
          >
            <div className="flex items-center gap-3">

              <div className="
                w-10
                h-10
                rounded-full
                bg-violet-600
                text-white
                flex
                items-center
                justify-center
                font-bold
              ">
                #{index + 1}
              </div>

              <div>
                <p className="font-bold">
                  {user.username ||
                    "Unknown"}
                </p>

                <p className="text-sm text-slate-500">
                  Rank #{index + 1}
                </p>
              </div>

            </div>

            <div className="
              bg-violet-100
              px-4
              py-2
              rounded-xl
              font-bold
              text-violet-700
            ">
              ⭐ {user.xp} XP
            </div>
          </div>
        )
      )}
    </div>
  </div>
);
}
export default Leaderboard;