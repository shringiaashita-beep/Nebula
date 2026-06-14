import { useState, useEffect } from "react";
import supabase from "../lib/supabase";

function StudyPlanSection() {
  const [hoursPerDay, setHoursPerDay] = useState(4);
  const [studyPlan, setStudyPlan] = useState([]);
  const [savedPlans, setSavedPlans] = useState([]);

  useEffect(() => {
    fetchSavedPlans();
  }, []);

  const fetchSavedPlans = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("study_plans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    console.log("FETCH SAVED PLANS:", data);
    console.log("FETCH ERROR:", error);

    if (!error) {
      setSavedPlans(data || []);
    }
  };

  const generatePlan = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("User not logged in");
      return;
    }

    const { data: exams, error } = await supabase
      .from("exams")
      .select("*")
      .eq("user_id", user.id);

    console.log("EXAMS:", exams);
    console.log("EXAMS ERROR:", error);

    if (error) {
      alert(error.message);
      return;
    }

    if (!exams || exams.length === 0) {
      alert("Add exams first");
      return;
    }

    const today = new Date();

    const sortedExams = [...exams].sort(
      (a, b) =>
        new Date(a.exam_date) -
        new Date(b.exam_date)
    );

    const generated = sortedExams.map(
      (exam, index) => {
        const examDate = new Date(
          exam.exam_date
        );

        const daysLeft = Math.ceil(
          (examDate - today) /
            (1000 * 60 * 60 * 24)
        );

        let priority = "Low";
        let studyHours = 1;

        if (index === 0) {
          priority = "High";
          studyHours = Math.max(
            Math.ceil(hoursPerDay * 0.5),
            1
          );
        } else if (index === 1) {
          priority = "Medium";
          studyHours = Math.max(
            Math.ceil(hoursPerDay * 0.3),
            1
          );
        } else {
          priority = "Low";
          studyHours = Math.max(
            Math.ceil(hoursPerDay * 0.2),
            1
          );
        }

        return {
          subject: exam.subject,
          priority,
          studyHours,
          examDate: exam.exam_date,
          daysLeft,
        };
      }
    );

    setStudyPlan(generated);

    alert("Plan Generated!");
  };

  const savePlan = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (studyPlan.length === 0) {
      alert("Generate a plan first");
      return;
    }

    for (const item of studyPlan) {
      const { error } = await supabase
        .from("study_plans")
        .insert([
          {
            user_id: user.id,
            subject: item.subject,
            priority: item.priority,
            study_hours: item.studyHours,
            exam_date: item.examDate,
            completed: false,
          },
        ]);

      if (error) {
        console.log(error);
      }
    }

    alert("Plan Saved!");

    fetchSavedPlans();
  };

  const toggleComplete = async (
  id,
  currentValue
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("User not found");
    return;
  }

  const { error } = await supabase
    .from("study_plans")
    .update({
      completed: !currentValue,
    })
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  if (!currentValue) {
    const today = new Date();

    const localDate =
      today.getFullYear() +
      "-" +
      String(
        today.getMonth() + 1
      ).padStart(2, "0") +
      "-" +
      String(
        today.getDate()
      ).padStart(2, "0");

    const {
      data: sessionData,
      error: sessionError,
    } = await supabase
      .from("study_sessions")
      .insert([
        {
          user_id: user.id,
          completed_date: localDate,
        },
      ])
      .select();

    console.log(
      "SESSION DATA:",
      sessionData
    );

    console.log(
      "SESSION ERROR:",
      sessionError
    );

    if (sessionError) {
      alert(sessionError.message);
    }
  }

  fetchSavedPlans();
};

  const deletePlan = async (id) => {
    const { error } = await supabase
      .from("study_plans")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchSavedPlans();
  };

  const completedCount =
    savedPlans.filter(
      (plan) => plan.completed
    ).length;

  const progress =
    savedPlans.length === 0
      ? 0
      : Math.round(
          (completedCount /
            savedPlans.length) *
            100
        );
        const closestExam =
  studyPlan.length > 0
    ? Math.min(
        ...studyPlan.map(
          (p) => p.daysLeft
        )
      )
    : 0;
        const todayMission =
  studyPlan.length > 0
    ? studyPlan[0]
    : null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow mt-8">
      <div className="grid md:grid-cols-4 gap-4 mb-6">
  <div className="bg-blue-500 text-white p-4 rounded-2xl shadow-lg">
    <h3 className="text-3xl font-bold">
      {studyPlan.length}
    </h3>
    <p>📚 Exams</p>
  </div>

  <div className="bg-orange-500 text-white p-4 rounded-2xl shadow-lg">
    <h3 className="text-3xl font-bold">
      {closestExam}
    </h3>
    <p>⏳ Days Left</p>
  </div>

  <div className="bg-green-500 text-white p-4 rounded-2xl shadow-lg">
    <h3 className="text-3xl font-bold">
      {completedCount}
    </h3>
    <p>🔥 Completed</p>
  </div>

  <div className="bg-purple-500 text-white p-4 rounded-2xl shadow-lg">
    <h3 className="text-3xl font-bold">
      {progress}%
    </h3>
    <p>⭐ Progress</p>
  </div>
</div>
      <h2 className="text-2xl font-bold mb-4">
        Smart AI Study Planner
      </h2>

      <input
        type="number"
        min="1"
        value={hoursPerDay}
        onChange={(e) =>
          setHoursPerDay(
            Number(e.target.value)
          )
        }
        className="border p-2 rounded-lg w-full mb-4"
      />

      <div className="flex gap-2 mb-6">
        <button
          onClick={generatePlan}
         className="
bg-gradient-to-r
from-violet-600
to-purple-600
text-white
px-8
py-3
rounded-xl
shadow-lg
hover:scale-105
transition-all
"                                                                                          
        > 
          Generate Plan
        </button>

        <button
          onClick={savePlan}
          className="
bg-gradient-to-r
from-green-500
to-emerald-600
text-white
px-8
py-3
rounded-xl
shadow-lg
hover:scale-105
transition-all
"
        >
          Save Plan
        </button>
      </div>
      {todayMission && (
  <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-6 rounded-2xl shadow-xl mb-6">
    <h3 className="text-2xl font-bold mb-3">
      🎯 Today's Mission
    </h3>

    <div className="space-y-2">
      <p>
        📚 Subject:
        {" "}
        {todayMission.subject}
      </p>

      <p>
        ⏳ Study:
        {" "}
        {todayMission.studyHours}
        h today
      </p>

      <p>
        🔥 Priority:
        {" "}
        {todayMission.priority}
      </p>

      <p>
        🚀 Reward:
        +50 XP
      </p>
    </div>
  </div>
)}

      <div className="border-l-8 border-blue-500 bg-blue-50 p-4 rounded-xl mb-3 shadow">
        <h3 className="font-bold mb-2">
  Progress: {progress}%
</h3>

<div className="w-full bg-slate-200 rounded-full h-4 mb-3">
  <div
    className="h-4 rounded-full bg-green-500 transition-all duration-500"
    style={{
      width: `${progress}%`,
    }}
  />
</div>

<p>
  ✅ Completed: {completedCount}/
  {savedPlans.length}
</p>
      </div>

      {studyPlan.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">
            Generated Plan
          </h3>

          {studyPlan.map((item, index) => (
            <div
  key={index}
  className="
  bg-gradient-to-r
  from-blue-50
  to-purple-50
  border-l-8
  border-violet-500
  p-5
  rounded-2xl
  shadow-lg
  mb-4
"
>
             <h3 className="text-2xl font-bold mb-2">
  📚 {item.subject}
</h3>

<p className="text-lg font-semibold">
  ⏳ {item.daysLeft} Days Left
</p>

<p
  className={`mt-2 font-bold ${
    item.daysLeft <= 3
      ? "text-red-600"
      : item.daysLeft <= 7
      ? "text-yellow-600"
      : "text-green-600"
  }`}
>
  {item.daysLeft <= 3
    ? "🚨 Critical"
    : item.daysLeft <= 7
    ? "⚠️ Moderate"
    : "✅ Safe"}
</p>

<p className="mt-2">
  🎯 Study Target:
  {" "}
  {item.studyHours}h/day
</p>

<p>
  🔥 Priority:
  {" "}
  {item.priority}
</p>

<div className="mt-4">
  <div className="w-full bg-slate-200 rounded-full h-3">
    <div
      className="bg-violet-600 h-3 rounded-full"
      style={{
        width: `${Math.max(
          10,
          100 - item.daysLeft * 5
        )}%`,
      }}
    />
  </div>
</div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold mb-4">
          Saved Plans
        </h3>

        {savedPlans.map((plan) => (
          <div
            key={plan.id}
            className="border p-4 rounded-lg mb-2 flex justify-between items-center"
          >
            <div>
              <strong>
                {plan.subject}
              </strong>

              <p>{plan.priority}</p>

              <p>
                {plan.study_hours}h/day
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  toggleComplete(
                    plan.id,
                    plan.completed
                  )
                }
                className={
                  plan.completed
                    ? "bg-green-600 text-white px-3 py-1 rounded"
                    : "bg-gray-500 text-white px-3 py-1 rounded"
                }
              >
                {plan.completed
                  ? "Completed"
                  : "Mark Done"}
              </button>

              <button
                onClick={() =>
                  deletePlan(plan.id)
                }
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudyPlanSection;