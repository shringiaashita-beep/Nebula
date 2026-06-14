import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import supabase from "../lib/supabase";

function StudyCalendar() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", user.id);

    console.log("SESSIONS:", data);
    console.log("ERROR:", error);

    setSessions(data || []);
  };

  const completedDates = sessions.map(
    (s) => s.completed_date
  );

  return (
    <div
  className="
  bg-gradient-to-br
  from-white
  to-violet-50
  p-6
  rounded-3xl
  shadow-2xl
  mt-8
  border
  border-violet-100
"
>
      <h2 className="text-3xl font-black mb-6">
  📅 Study Calendar
</h2>
      

      <Calendar
       tileClassName={({ date, view }) => {
  if (view !== "month") return "";

  const formattedDate =
    date.getFullYear() +
    "-" +
    String(
      date.getMonth() + 1
    ).padStart(2, "0") +
    "-" +
    String(
      date.getDate()
    ).padStart(2, "0");

  if (
    completedDates.includes(
      formattedDate
    )
  ) {
    return "completed-day";
  }

  return "";
}} 
        tileContent={({ date, view }) => {
          if (view !== "month") return null;

          const formattedDate =
  date.getFullYear() +
  "-" +
  String(
    date.getMonth() + 1
  ).padStart(2, "0") +
  "-" +
  String(
    date.getDate()
  ).padStart(2, "0");

          if (
            completedDates.includes(
              formattedDate
            )
          ) {
            return (
              <div className="flex justify-center mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            );
          }

          return null;
        }}
      />
    </div>
  );
}

export default StudyCalendar;