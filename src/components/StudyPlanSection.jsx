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

  return (
    <div className="bg-white p-6 rounded-2xl shadow mt-8">
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
          className="bg-black text-white px-6 py-3 rounded-lg"
        >
          Generate Plan
        </button>

        <button
          onClick={savePlan}
          className="bg-green-600 text-white px-6 py-3 rounded-lg"
        >
          Save Plan
        </button>
      </div>

      <div className="bg-slate-100 p-4 rounded-xl mb-6">
        <h3 className="font-bold">
          Progress: {progress}%
        </h3>

        <p>
          Completed: {completedCount}/
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
              className="border p-4 rounded-lg mb-2"
            >
              <strong>
                {item.subject}
              </strong>

              <p>
                Priority: {item.priority}
              </p>

              <p>
                Days Left: {item.daysLeft}
              </p>

              <p>
                Study: {item.studyHours}h/day
              </p>
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