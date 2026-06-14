import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

function DailyQuests() {
  const [quests, setQuests] =
    useState([]);

  const [claimed, setClaimed] =
    useState([]);

  useEffect(() => {
    fetchQuests();
    fetchClaimedQuests();
  }, []);

  const fetchQuests = async () => {
    const { data, error } =
      await supabase
        .from("daily_quests")
        .select("*");

    if (error) {
      console.log(error);
      return;
    }

    setQuests(data || []);
  };

  const fetchClaimedQuests =
    async () => {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) return;

      const { data } =
        await supabase
          .from("user_quests")
          .select("quest_id")
          .eq(
            "user_id",
            user.id
          );

      setClaimed(
        data?.map(
          (q) => q.quest_id
        ) || []
      );
    };

  const claimReward = async (
    quest
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (
      claimed.includes(
        quest.id
      )
    ) {
      alert(
        "Already claimed!"
      );
      return;
    }

    const { data: profile } =
      await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    const currentXP =
      profile?.xp || 0;

    const newXP =
      currentXP +
      quest.reward_xp;

    let newLevel = 1;

    if (newXP >= 1000)
      newLevel = 5;
    else if (newXP >= 500)
      newLevel = 4;
    else if (newXP >= 250)
      newLevel = 3;
    else if (newXP >= 100)
      newLevel = 2;

    await supabase
      .from("profiles")
      .update({
        xp: newXP,
        level: newLevel,
      })
      .eq("id", user.id);

    const { error: questError } =
  await supabase
    .from("user_quests")
    .insert([
      {
        user_id: user.id,
        quest_id: quest.id,
        completed: true,
        completed_at:
          new Date(),
      },
    ]);

console.log(
  "QUEST ERROR:",
  questError
);

setClaimed((prev) => [
  ...prev,
  quest.id,
]);

    alert(
      `🎉 Reward Claimed!\n+${quest.reward_xp} XP`
    );
  };

  return (
  <div className="bg-white p-6 rounded-3xl shadow-xl mb-6">
    <h2 className="text-3xl font-black mb-6">
      🎯 Daily Missions
    </h2>

    <div className="space-y-4">
      {quests.map((quest) => (
        <div
          key={quest.id}
          className="
          bg-gradient-to-r
          from-orange-50
          to-yellow-50
          border-l-8
          border-orange-500
          rounded-2xl
          p-5
          shadow-lg
        "
        >
          <div className="flex justify-between items-center">

            <div>
              <h3 className="text-xl font-bold">
                {quest.title}
              </h3>

              <p className="mt-2 text-slate-600">
                ⭐ Reward:
                {" "}
                {quest.reward_xp}
                {" "}
                XP
              </p>
            </div>

            <div>
              {claimed.includes(
                quest.id
              ) ? (
                <span
                  className="
                  bg-green-600
                  text-white
                  px-4
                  py-2
                  rounded-xl
                  font-semibold
                "
                >
                  ✅ Claimed
                </span>
              ) : (
                <button
                  onClick={() =>
                    claimReward(
                      quest
                    )
                  }
                  className="
                  bg-gradient-to-r
                  from-orange-500
                  to-red-500
                  text-white
                  px-5
                  py-2
                  rounded-xl
                  shadow-lg
                  hover:scale-105
                  transition-all
                "
                >
                  Claim Reward
                </button>
              )}
            </div>

          </div>
        </div>
      ))}
    </div>
  </div>
);
}
export default DailyQuests;