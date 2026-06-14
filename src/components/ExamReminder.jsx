import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import {
  requestNotificationPermission,
  showNotification,
} from "../utils/notifications";

function ExamReminder() {
  const [exams, setExams] =
    useState([]);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } =
      await supabase
        .from("exams")
        .select("*")
        .eq("user_id", user.id)
        .order("exam_date");

    setExams(data || []);
    await requestNotificationPermission();

(data || []).forEach(
  (exam) => {
    const today =
      new Date();

    const examDate =
      new Date(
        exam.exam_date
      );

    const daysLeft =
      Math.ceil(
        (examDate -
          today) /
          (1000 *
            60 *
            60 *
            24)
      );

    if (
      daysLeft <= 1 &&
      daysLeft >= 0
    ) {
      showNotification(
        "⚠️ Exam Alert",
        `${exam.subject} exam is ${
          daysLeft === 0
            ? "today"
            : "tomorrow"
        }`
      );
    }
  }
);
  };

  const getDaysLeft = (
    examDate
  ) => {
    const today =
      new Date();

    const exam =
      new Date(examDate);

    return Math.ceil(
      (exam - today) /
        (1000 *
          60 *
          60 *
          24)
    );
  };

  if (
    exams.length === 0
  ) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl mb-6">
      <h2 className="text-2xl font-bold mb-4">
        🚨 Upcoming Exams
      </h2>

      {exams.map(
        (exam) => {
          const daysLeft =
            getDaysLeft(
              exam.exam_date
            );

          let color =
            "text-green-600";

          if (
            daysLeft <= 7
          )
            color =
              "text-orange-500";

          if (
            daysLeft <= 1
          )
            color =
              "text-red-600";

          return (
            <div
              key={exam.id}
              className="border-b py-3"
            >
              <p className="font-semibold">
                {exam.subject}
              </p>

              <p
                className={`font-bold ${color}`}
              >
                {daysLeft ===
                0
                  ? "Exam Today"
                  : `${daysLeft} Days Left`}
              </p>
            </div>
          );
        }
      )}
    </div>
  );
}

export default ExamReminder;