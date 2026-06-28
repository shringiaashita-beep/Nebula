import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import supabase from "../lib/supabase";

function StudyCalendar() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => { fetchSessions(); }, []);

  // ── Supabase fetch untouched ────────────────────────────────
  const fetchSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("study_sessions").select("*").eq("user_id", user.id);
    if (error) {
      console.error("SESSIONS FETCH ERROR:", error);
    }
    setSessions(data || []);
  };

  const completedDates = sessions.map((s) => s.completed_date);

  // ── Tile classname logic untouched ─────────────────────────
  const tileClassName = ({ date, view }) => {
    if (view !== "month") return "";
    const formatted =
      date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, "0") + "-" +
      String(date.getDate()).padStart(2, "0");
    return completedDates.includes(formatted) ? "completed-day" : "";
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const formatted =
      date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, "0") + "-" +
      String(date.getDate()).padStart(2, "0");
    if (completedDates.includes(formatted)) {
      return (
        <div className="flex justify-center mt-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--arc-gold-400)" }} />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="arc-card p-6 space-y-5">
      {/* Header */}
      <div>
        <h2 className="arc-font-display text-2xl font-bold arc-text-gradient">
          📅 Study Calendar
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--arc-text-secondary)" }}>
          Track your active study days — gold highlights = completed sessions
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ background: "var(--arc-gold-500)" }} />
        <span className="text-xs" style={{ color: "var(--arc-text-muted)" }}>
          Completed Study Day
        </span>
      </div>

      {/* Calendar — react-calendar, dark-styled via index.css */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid var(--arc-border)" }}
      >
        <Calendar
          tileClassName={tileClassName}
          tileContent={tileContent}
        />
      </div>
    </div>
  );
}

export default StudyCalendar;