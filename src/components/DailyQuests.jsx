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
    <div className="bg-white p-6 rounded-2xl shadow mb-6">
      <h2 className="text-2xl font-bold mb-4">
        🎯 Daily Quests
      </h2>

      {quests.map((quest) => (
        <div
          key={quest.id}
          className="border rounded-lg p-3 mb-3"
        >
          <p className="font-semibold">
            {quest.title}
          </p>

          <p className="mb-2">
            Reward:
            +{quest.reward_xp} XP
          </p>

          {claimed.includes(
            quest.id
          ) ? (
            <span className="bg-green-600 text-white px-3 py-1 rounded">
              ✅ Claimed
            </span>
          ) : (
            <button
              onClick={() =>
                claimReward(
                  quest
                )
              }
              className="bg-orange-500 text-white px-3 py-1 rounded"
            >
              Claim Reward
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default DailyQuests;