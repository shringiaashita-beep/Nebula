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
      <h2 className="text-4xl font-black mb-2">
  📚 Subject Academy
</h2>

<p className="text-slate-500 mb-6">
  Organize and manage your learning universe
</p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newSubject}
          onChange={(e) =>
            setNewSubject(e.target.value)
          }
          placeholder="Add Subject"
          className="
flex-1
p-4
rounded-2xl
border-2
border-violet-200
focus:outline-none
focus:border-violet-500
"     
            />

        <button
          onClick={addSubject}
         className="
bg-gradient-to-r
from-violet-600
to-purple-700
text-white
px-6
rounded-2xl
font-bold
shadow-lg
hover:scale-105
transition-all
">
          Add
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="grid md:grid-cols-3 gap-4 mb-6">

  <div className="bg-blue-500 text-white p-4 rounded-2xl shadow-lg">
    <h3 className="text-3xl font-bold">
      {subjects.length}
    </h3>
    <p>Total Subjects</p>
  </div>

  <div className="bg-green-500 text-white p-4 rounded-2xl shadow-lg">
    <h3 className="text-3xl font-bold">
      {subjects.length}
    </h3>
    <p>Active</p>
  </div>

  <div className="bg-violet-500 text-white p-4 rounded-2xl shadow-lg">
    <h3 className="text-3xl font-bold">
      🚀
    </h3>
    <p>Learning Hub</p>
  </div>

</div>
        {subjects.map((subject) => (
          <div
  key={subject.id}
  className="
  bg-gradient-to-r
  from-white
  to-slate-50
  p-5
  rounded-3xl
  shadow-lg
  hover:shadow-2xl
  hover:-translate-y-1
  transition-all
  duration-300
  border
  border-slate-100
  "
> 
            <div className="flex items-center gap-4">

  <div
    className="
    w-14
    h-14
    rounded-2xl
    bg-violet-100
    flex
    items-center
    justify-center
    text-2xl
    "
  >
    📚
  </div>

  <div>
    <h3 className="text-xl font-bold">
      {subject.name}
    </h3>

    <p className="text-slate-500 text-sm">
      Ready for study
    </p>
  </div>

</div>
            <button
  onClick={() =>
    deleteSubject(subject.id)
  }
  className="
  bg-gradient-to-r
  from-red-500
  to-red-600
  text-white
  px-4
  py-2
  rounded-xl
  shadow-md
  hover:scale-105
  transition-all
  "
>
  🗑 Delete
</button>
          
          </div>
        ))
        }
      </div>
    
    </div>
  );
}

export default SubjectsSection;