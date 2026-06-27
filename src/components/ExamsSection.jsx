import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

function ExamsSection() {
  const [subject, setSubject]   = useState("");
  const [examDate, setExamDate] = useState("");
  const [exams, setExams]       = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => { fetchExams(); }, []);

  // ── All Supabase CRUD logic untouched ───────────────────────
  const fetchExams = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { console.log("No user found"); return; }
    const { data, error } = await supabase
      .from("exams").select("*").eq("user_id", user.id).order("exam_date");
    console.log("FETCH DATA:", data, "FETCH ERROR:", error);
    if (!error) setExams(data || []);
  };

  const addExam = async () => {
    setErrorMsg(""); setSuccessMsg("");
    if (!subject.trim()) { setErrorMsg("Please enter a subject name."); return; }
    if (!examDate)       { setErrorMsg("Please select an exam date.");  return; }

    const { data: { user } } = await supabase.auth.getUser();
    console.log("USER:", user);
    if (!user) { setErrorMsg("User not logged in."); return; }

    const { data, error } = await supabase
      .from("exams").insert([{ subject, exam_date: examDate, user_id: user.id }]).select();
    console.log("INSERT DATA:", data, "INSERT ERROR:", error);

    if (error) { setErrorMsg(error.message); return; }

    setSuccessMsg("Exam saved successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
    setSubject(""); setExamDate("");
    fetchExams();
  };

  const deleteExam = async (id) => {
    const { error } = await supabase.from("exams").delete().eq("id", id);
    if (error) { setErrorMsg(error.message); return; }
    fetchExams();
  };

  return (
    <div className="arc-card p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="arc-font-display text-2xl font-bold arc-text-gradient">
          📅 Exam Schedule
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--arc-text-secondary)" }}>
          Log your upcoming exams for smart study planning
        </p>
      </div>

      {/* Inline alerts — no alert() */}
      {errorMsg && (
        <div className="arc-alert-error">
          <span>⚠</span><span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="arc-alert-success">
          <span>✓</span><span>{successMsg}</span>
        </div>
      )}

      {/* Add exam form */}
      <div className="grid sm:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Subject name"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="arc-input text-sm sm:col-span-1"
          style={{ background: "rgba(0,0,0,0.4)" }}
        />
        <input
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          className="arc-input text-sm sm:col-span-1"
          style={{ background: "rgba(0,0,0,0.4)", colorScheme: "dark" }}
        />
        <button
          onClick={addExam}
          className="arc-btn-gold py-2.5 px-5 text-sm rounded-xl sm:col-span-1"
        >
          Save Exam
        </button>
      </div>

      {/* Exam list */}
      <div className="space-y-2">
        {exams.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: "var(--arc-text-muted)" }}>
            No exams added yet. Schedule your first exam above.
          </p>
        ) : (
          exams.map((exam) => (
            <div
              key={exam.id}
              className="flex items-center justify-between px-4 py-3.5 rounded-xl transition-all"
              style={{
                background: "var(--arc-bg-elevated)",
                border: "1px solid var(--arc-border)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--arc-border)"; }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                  style={{
                    background: "rgba(212,175,55,0.08)",
                    border: "1px solid rgba(212,175,55,0.15)",
                  }}
                >
                  📅
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--arc-text-primary)" }}>
                    {exam.subject}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--arc-text-muted)" }}>
                    {exam.exam_date}
                  </p>
                </div>
              </div>
              <button
                onClick={() => deleteExam(exam.id)}
                className="arc-btn-ghost px-3 py-1.5 text-xs rounded-lg"
                style={{ color: "var(--arc-error)", borderColor: "rgba(239,68,68,0.2)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                  e.currentTarget.style.borderColor = "rgba(239,68,68,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)";
                }}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ExamsSection;