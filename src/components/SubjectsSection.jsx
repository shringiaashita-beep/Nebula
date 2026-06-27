import { useState, useEffect } from "react";
import supabase from "../lib/supabase";

function SubjectsSection() {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");

  useEffect(() => { fetchSubjects(); }, []);

  // ── All Supabase CRUD logic untouched ───────────────────────
  const fetchSubjects = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("subjects").select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setSubjects(data || []);
  };

  const addSubject = async () => {
    if (!newSubject.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("subjects").insert([{ name: newSubject, user_id: user.id }]);
    setNewSubject("");
    fetchSubjects();
  };

  const deleteSubject = async (id) => {
    await supabase.from("subjects").delete().eq("id", id);
    fetchSubjects();
  };

  return (
    <div className="arc-card p-6 space-y-6">

      {/* Header */}
      <div>
        <h2 className="arc-font-display text-2xl font-bold arc-text-gradient">
          📚 Subject Academy
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--arc-text-secondary)" }}>
          Organize and manage your learning universe
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Subjects", value: subjects.length, icon: "◈" },
          { label: "Active",         value: subjects.length, icon: "◉" },
          { label: "Learning Hub",   value: "🚀",            icon: "⬡" },
        ].map(({ label, value, icon }) => (
          <div
            key={label}
            className="arc-card-elevated px-4 py-3 flex flex-col gap-1"
          >
            <span className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--arc-text-muted)" }}>
              {label}
            </span>
            <span className="text-2xl font-black" style={{ color: "var(--arc-text-hero)" }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Add subject input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addSubject()}
          placeholder="Add new subject…"
          className="arc-input flex-1 text-sm"
          style={{
            background: "rgba(0,0,0,0.4)",
            border: "1px solid var(--arc-border-subtle)",
          }}
        />
        <button
          onClick={addSubject}
          className="arc-btn-gold px-5 py-2.5 text-sm font-bold rounded-xl"
        >
          Add
        </button>
      </div>

      {/* Subject list */}
      <div className="grid md:grid-cols-2 gap-3">
        {subjects.length === 0 ? (
          <p className="col-span-2 text-sm text-center py-8"
            style={{ color: "var(--arc-text-muted)" }}>
            No subjects added yet. Add your first subject above.
          </p>
        ) : (
          subjects.map((subject) => (
            <div
              key={subject.id}
              className="flex items-center justify-between px-4 py-3.5 rounded-xl transition-all"
              style={{
                background: "var(--arc-bg-elevated)",
                border: "1px solid var(--arc-border)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--arc-border)";
              }}
            >
              <div className="flex items-center gap-3">
                {/* Icon badge */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{
                    background: "rgba(212,175,55,0.08)",
                    border: "1px solid rgba(212,175,55,0.15)",
                  }}
                >
                  📚
                </div>
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: "var(--arc-text-primary)" }}>
                    {subject.name}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: "var(--arc-text-muted)" }}>
                    Ready for study
                  </p>
                </div>
              </div>

              <button
                onClick={() => deleteSubject(subject.id)}
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
                🗑 Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SubjectsSection;