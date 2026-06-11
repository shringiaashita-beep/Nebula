import { useState, useEffect } from "react";
import supabase from "../lib/supabase";

function ExamsSection() {
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [exams, setExams] = useState([]);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("No user found");
      return;
    }

    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("user_id", user.id)
      .order("exam_date");

    console.log("FETCH DATA:", data);
    console.log("FETCH ERROR:", error);

    if (!error) {
      setExams(data || []);
    }
  };

  const addExam = async () => {
    if (!subject.trim()) {
      alert("Enter subject");
      return;
    }

    if (!examDate) {
      alert("Select exam date");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("USER:", user);

    if (!user) {
      alert("User not logged in");
      return;
    }

    const { data, error } = await supabase
      .from("exams")
      .insert([
        {
          subject,
          exam_date: examDate,
          user_id: user.id,
        },
      ])
      .select();

    console.log("INSERT DATA:", data);
    console.log("INSERT ERROR:", error);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Exam saved successfully!");

    setSubject("");
    setExamDate("");

    fetchExams();
  };

  const deleteExam = async (id) => {
    const { error } = await supabase
      .from("exams")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchExams();
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">
        Exams
      </h2>

      <div className="grid md:grid-cols-3 gap-2 mb-4">
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) =>
            setSubject(e.target.value)
          }
          className="border p-2 rounded-lg"
        />

        <input
          type="date"
          value={examDate}
          onChange={(e) =>
            setExamDate(e.target.value)
          }
          className="border p-2 rounded-lg"
        />

        <button
          onClick={addExam}
          className="bg-black text-white rounded-lg"
        >
          Save Exam
        </button>
      </div>

      {exams.length === 0 ? (
        <p>No exams added yet.</p>
      ) : (
        exams.map((exam) => (
          <div
            key={exam.id}
            className="border p-4 rounded-lg flex justify-between items-center mb-2"
          >
            <div>
              <p className="font-semibold">
                {exam.subject}
              </p>

              <p>{exam.exam_date}</p>
            </div>

            <button
              onClick={() =>
                deleteExam(exam.id)
              }
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default ExamsSection;