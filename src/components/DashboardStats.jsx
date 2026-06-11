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
    <div className="grid md:grid-cols-5 gap-4 mb-8">
      <div className="bg-white p-5 rounded-xl shadow">
        <h3 className="text-gray-500 text-sm">
          Subjects
        </h3>
        <p className="text-3xl font-bold">
          📚 {stats.subjects}
        </p>
      </div>

      <div className="bg-white p-5 rounded-xl shadow">
        <h3 className="text-gray-500 text-sm">
          Exams
        </h3>
        <p className="text-3xl font-bold">
          📝 {stats.exams}
        </p>
      </div>

      <div className="bg-white p-5 rounded-xl shadow">
        <h3 className="text-gray-500 text-sm">
          Plans
        </h3>
        <p className="text-3xl font-bold">
          📋 {stats.plans}
        </p>
      </div>

      <div className="bg-white p-5 rounded-xl shadow">
        <h3 className="text-gray-500 text-sm">
          Completed
        </h3>
        <p className="text-3xl font-bold">
          ✅ {stats.completed}
        </p>
      </div>

      <div className="bg-white p-5 rounded-xl shadow">
        <h3 className="text-gray-500 text-sm">
          Streak
        </h3>
        <p className="text-3xl font-bold">
          🔥 {stats.streak}
        </p>
      </div>
    </div>
  );
}

export default DashboardStats;