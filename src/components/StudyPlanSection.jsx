import { useState, useEffect } from "react";
import supabase from "../lib/supabase";
import { useTranslation } from "react-i18next";

function StudyPlanSection() {
  const { t } = useTranslation();
  const [hoursPerDay, setHoursPerDay] = useState(4);
  const [studyPlan, setStudyPlan] = useState([]);
  const [savedPlans, setSavedPlans] = useState([]);
  const [infoMsg, setInfoMsg] = useState("");
  const [infoType, setInfoType] = useState("success");
  const [isGenerating, setIsGenerating] = useState(false);

  const showInfo = (msg, type = "success") => {
    setInfoMsg(msg);
    setInfoType(type);
    setTimeout(() => setInfoMsg(""), 4000);
  };

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



    if (!error) {
      setSavedPlans(data || []);
    }
  };

  const generatePlan = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        showInfo("⚠️ User not logged in. Please refresh and try again.", "error");
        return;
      }

      const { data: exams, error } = await supabase
        .from("exams")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        showInfo("⚠️ " + error.message, "error");
        return;
      }

      if (!exams || exams.length === 0) {
        showInfo("⚠️ No exams found. Add your exams first in the Exams section.", "error");
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
      showInfo("✅ Study plan generated successfully!");
    } finally {
      setIsGenerating(false);
    }
  };

  const savePlan = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (studyPlan.length === 0) {
      showInfo("Generate a plan first.");
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
        console.error(error);
      }
    }

    showInfo("✓ Plan saved!");
    fetchSavedPlans();
  };

  const toggleComplete = async (
  id,
  currentValue
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) { showInfo("User not found."); return; }

  const { error } = await supabase
    .from("study_plans")
    .update({
      completed: !currentValue,
    })
    .eq("id", id);

  if (error) { showInfo(error.message); return; }

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



    if (sessionError) { showInfo(sessionError.message); }
  }

  fetchSavedPlans();
};

  const deletePlan = async (id) => {
    const { error } = await supabase
      .from("study_plans")
      .delete()
      .eq("id", id);

    if (error) {
      showInfo("⚠️ " + error.message, "error");
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
    <div className="space-y-6">

      {/* Info toast */}
      {infoMsg && (
        <div className="arc-alert-success">
          <span>✓</span><span>{infoMsg}</span>
        </div>
      )}

      {/* ── Planner header ──────────────────────────────── */}
      <div className="arc-card p-6 space-y-5" style={{ borderTop: "2px solid var(--arc-gold-500)" }}>
        <div>
          <h2 className="arc-font-display text-2xl font-bold arc-text-gradient">⚡ {t("Navigation.Study Planner")}</h2>
          <p className="text-sm mt-1" style={{ color: "var(--arc-text-secondary)" }}>Generate a personalised plan based on your exam schedule</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Exams",     value: studyPlan.length, icon: "📚" },
            { label: "Days Left", value: closestExam,       icon: "⏳" },
            { label: "Completed", value: completedCount,    icon: "🔥" },
            { label: "Progress",  value: `${progress}%`,   icon: "⭐" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="arc-card-elevated p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--arc-text-muted)" }}>{label}</span>
                <span style={{ color: "var(--arc-gold-400)" }}>{icon}</span>
              </div>
              <span className="text-2xl font-black" style={{ color: "var(--arc-text-hero)" }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Hours input + actions */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold" style={{ color: "var(--arc-text-secondary)" }}>Hours/Day</label>
            <input
              type="number" min="1"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              className="arc-input w-20 text-center text-sm"
              style={{ background: "rgba(0,0,0,0.4)" }}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={generatePlan} className="arc-btn-gold px-5 py-2.5 text-sm rounded-xl">{t("Buttons.Generate")}</button>
            <button onClick={savePlan}     className="arc-btn-ghost px-5 py-2.5 text-sm rounded-xl">{t("Buttons.Save")}</button>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs mb-1.5 font-medium" style={{ color: "var(--arc-text-secondary)" }}>
            <span>Overall Completion</span>
            <span style={{ color: "var(--arc-gold-400)" }}>{progress}%  — {completedCount}/{savedPlans.length} plans</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "linear-gradient(to right, var(--arc-gold-500), var(--arc-gold-400))" }} />
          </div>
        </div>
      </div>

      {/* ── Today's Mission ─────────────────────────────── */}
      {todayMission && (
        <div className="arc-card p-5" style={{ border: "1px solid rgba(212,175,55,0.3)", background: "rgba(212,175,55,0.05)" }}>
          <h3 className="arc-font-display text-lg font-bold arc-text-gold mb-3">🎯 {t("Planner.Today's Tasks")}</h3>
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            {[
              ["📚 Subject", todayMission.subject],
              ["⏳ Study", `${todayMission.studyHours}h today`],
              ["🔥 Priority", todayMission.priority],
              ["🚀 Reward", "+50 XP"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center gap-2">
                <span style={{ color: "var(--arc-text-muted)" }}>{k}:</span>
                <span className="font-semibold" style={{ color: "var(--arc-text-primary)" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Generated Plan ──────────────────────────────── */}
      {studyPlan.length > 0 && (
        <div className="arc-card p-6 space-y-4">
          <h3 className="arc-font-display text-lg font-bold arc-text-gradient">Generated Plan</h3>
          {studyPlan.map((item, index) => {
            const urgencyColor = item.daysLeft <= 3 ? "var(--arc-error)" : item.daysLeft <= 7 ? "var(--arc-gold-400)" : "var(--arc-success)";
            const urgencyLabel = item.daysLeft <= 3 ? "🚨 Critical" : item.daysLeft <= 7 ? "⚠️ Moderate" : "✅ Safe";
            const fillPct = Math.max(10, 100 - item.daysLeft * 5);
            return (
              <div key={index} className="arc-card-elevated p-5 space-y-3"
                style={{ borderLeft: `3px solid ${urgencyColor}` }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-base" style={{ color: "var(--arc-text-primary)" }}>📚 {item.subject}</h4>
                    <p className="text-xs mt-0.5" style={{ color: "var(--arc-text-muted)" }}>⏳ {item.daysLeft} days left · 🎯 {item.studyHours}h/day</p>
                  </div>
                  <span className="text-xs font-bold" style={{ color: urgencyColor }}>{urgencyLabel}</span>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${fillPct}%`, background: `linear-gradient(to right, ${urgencyColor}, ${urgencyColor}88)` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Saved Plans ─────────────────────────────────── */}
      {savedPlans.length > 0 && (
        <div className="arc-card p-6 space-y-3">
          <h3 className="arc-font-display text-lg font-bold arc-text-gradient">Saved Plans</h3>
          {savedPlans.map((plan) => (
            <div key={plan.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl transition-all"
              style={{
                background: plan.completed ? "rgba(16,185,129,0.05)" : "var(--arc-bg-elevated)",
                border: `1px solid ${plan.completed ? "rgba(16,185,129,0.2)" : "var(--arc-border)"}`,
              }}>
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--arc-text-primary)" }}>{plan.subject}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--arc-text-muted)" }}>
                  {plan.priority} · {plan.study_hours}h/day
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleComplete(plan.id, plan.completed)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: plan.completed ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.05)",
                    color: plan.completed ? "var(--arc-success)" : "var(--arc-text-secondary)",
                    border: `1px solid ${plan.completed ? "rgba(16,185,129,0.25)" : "var(--arc-border)"}`,
                  }}>
                  {plan.completed ? "✓ Done" : "Mark Done"}
                </button>
                <button
                  onClick={() => deletePlan(plan.id)}
                  className="arc-btn-ghost px-3 py-1.5 text-xs rounded-lg"
                  style={{ color: "var(--arc-error)", borderColor: "rgba(239,68,68,0.2)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                  {t("Buttons.Delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudyPlanSection;