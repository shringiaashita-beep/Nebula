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
        (plan) => plan.completed === true
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

 return (
  <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-5 mb-8">

    <div className="
      bg-gradient-to-br
      from-blue-500
      to-cyan-500
      text-white
      p-6
      rounded-3xl
      shadow-xl
    ">
      <p className="text-sm opacity-80">
        Subjects
      </p>

      <h3 className="text-4xl font-black mt-2">
        📚 {stats.subjects}
      </h3>
    </div>

    <div className="
      bg-gradient-to-br
      from-orange-500
      to-red-500
      text-white
      p-6
      rounded-3xl
      shadow-xl
    ">
      <p className="text-sm opacity-80">
        Exams
      </p>

      <h3 className="text-4xl font-black mt-2">
        📝 {stats.exams}
      </h3>
    </div>

    <div className="
      bg-gradient-to-br
      from-violet-500
      to-purple-700
      text-white
      p-6
      rounded-3xl
      shadow-xl
    ">
      <p className="text-sm opacity-80">
        Study Plans
      </p>

      <h3 className="text-4xl font-black mt-2">
        📋 {stats.plans}
      </h3>
    </div>

    <div className="
      bg-gradient-to-br
      from-green-500
      to-emerald-600
      text-white
      p-6
      rounded-3xl
      shadow-xl
    ">
      <p className="text-sm opacity-80">
        Completed
      </p>

      <h3 className="text-4xl font-black mt-2">
        ✅ {stats.completed}
      </h3>
    </div>

    <div className="
      bg-gradient-to-br
      from-pink-500
      to-rose-600
      text-white
      p-6
      rounded-3xl
      shadow-xl
    ">
      <p className="text-sm opacity-80">
        Study Streak
      </p>

      <h3 className="text-4xl font-black mt-2">
        🔥 {stats.streak}
      </h3>
    </div>

  </div>
);
}
export default DashboardStats;