import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

function DashboardStats() {
const [stats, setStats] = useState({
subjects: 0,
exams: 0,
plans: 0,
completed: 0,
streak: 0,
});

useEffect(() => {
fetchStats();
}, []);

const fetchStats = async () => {
const {
data: { user },
} = await supabase.auth.getUser();

if (!user) return;

const { data: subjects } = await supabase
  .from("subjects")
  .select("*")
  .eq("user_id", user.id);

const { data: exams } = await supabase
  .from("exams")
  .select("*")
  .eq("user_id", user.id);

const { data: plans } = await supabase
  .from("study_plans")
  .select("*")
  .eq("user_id", user.id);

const { data: sessions } = await supabase
  .from("study_sessions")
  .select("*")
  .eq("user_id", user.id);

const completed =
  plans?.filter(
    (plan) => plan.completed
  ).length || 0;

const streak =
  [...new Set(
    sessions?.map(
      (session) =>
        session.completed_date
    )
  )].length || 0;

setStats({
  subjects: subjects?.length || 0,
  exams: exams?.length || 0,
  plans: plans?.length || 0,
  completed,
  streak,
});


};

const totalProgress =
stats.plans === 0
? 0
: Math.round(
(stats.completed /
stats.plans) *
100
);

return ( <div className="space-y-8 mb-8">


  <div
    className="
    bg-gradient-to-br
    from-slate-900
    via-violet-900
    to-slate-900
    text-white
    p-8
    rounded-[32px]
    shadow-2xl
    overflow-hidden
    relative
    "
  >
    <div className="absolute top-0 right-0 text-8xl opacity-10">
      🌌
    </div>

    <h1 className="text-4xl font-black">
      Welcome Back
    </h1>

    <p className="text-slate-300 mt-2">
      Keep learning. Keep growing.
    </p>

    <div className="mt-8">
      <div className="flex justify-between mb-2">
        <span>
          Overall Progress
        </span>

        <span>
          {totalProgress}%
        </span>
      </div>

      <div className="w-full h-4 bg-white/10 rounded-full">
        <div
          className="
          h-4
          rounded-full
          bg-gradient-to-r
          from-cyan-400
          to-violet-400
          "
          style={{
            width: `${totalProgress}%`,
          }}
        />
      </div>
    </div>

    <div className="flex gap-3 mt-6 flex-wrap">

      <div className="bg-white/10 px-4 py-2 rounded-full">
        📚 {stats.subjects} Subjects
      </div>

      <div className="bg-white/10 px-4 py-2 rounded-full">
        📝 {stats.exams} Exams
      </div>

      <div className="bg-white/10 px-4 py-2 rounded-full">
        🔥 {stats.streak} Day Streak
      </div>

    </div>
  </div>

 <div
  className="
  bg-white
  rounded-[32px]
  p-8
  shadow-xl
  "
>
  <h2 className="text-2xl font-black mb-6">
    📊 Quick Overview
  </h2>

  <div
  className="
  grid
  grid-cols-1
  sm:grid-cols-2
  lg:grid-cols-3
  gap-6
  "
>

    <div>
      <p className="text-slate-500">
        Subjects
      </p>

      <h3 className="text-4xl font-black">
        {stats.subjects}
      </h3>
    </div>

    <div>
      <p className="text-slate-500">
        Exams
      </p>

      <h3 className="text-4xl font-black">
        {stats.exams}
      </h3>
    </div>

    <div>
      <p className="text-slate-500">
        Study Plans
      </p>

      <h3 className="text-4xl font-black">
        {stats.plans}
      </h3>
    </div>

    <div>
      <p className="text-slate-500">
        Completed
      </p>

      <h3 className="text-4xl font-black text-green-600">
        {stats.completed}
      </h3>
    </div>

    <div>
      <p className="text-slate-500">
        Study Streak
      </p>

      <h3 className="text-4xl font-black text-orange-500">
        {stats.streak}
      </h3>
    </div>

  </div>

  </div>

  <div
    className="
    bg-gradient-to-r
    from-orange-500
    to-red-500
    text-white
    p-6
    rounded-3xl
    shadow-xl
    "
  >
    <h3 className="text-2xl font-black">
      🎯 Today's Mission
    </h3>

    <div className="mt-4 space-y-2">
      <p>☐ Complete 1 Topic</p>
      <p>☐ Revise 1 Subject</p>
      <p>☐ Solve 10 Questions</p>
    </div>

    <div className="mt-4 font-bold">
      Reward: +50 XP
    </div>
  </div>

</div>

);
}

export default DashboardStats;
