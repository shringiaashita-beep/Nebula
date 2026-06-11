import { useState, useEffect } from "react";
import supabase from "../lib/supabase";

function SubjectsSection() {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("subjects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    setSubjects(data || []);
  };

  const addSubject = async () => {
    if (!newSubject.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("subjects").insert([
      {
        name: newSubject,
        user_id: user.id,
      },
    ]);

    setNewSubject("");
    fetchSubjects();
  };

  const deleteSubject = async (id) => {
    await supabase
      .from("subjects")
      .delete()
      .eq("id", id);

    fetchSubjects();
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-4">
        Subjects
      </h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newSubject}
          onChange={(e) =>
            setNewSubject(e.target.value)
          }
          placeholder="Add Subject"
          className="border p-2 rounded-lg flex-1"
        />

        <button
          onClick={addSubject}
          className="bg-black text-white px-4 rounded-lg"
        >
          Add
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="border p-4 rounded-lg flex justify-between items-center"
          >
            <span>{subject.name}</span>

            <button
              onClick={() =>
                deleteSubject(subject.id)
              }
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SubjectsSection;