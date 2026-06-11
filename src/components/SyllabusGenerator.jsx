import { useState } from "react";
import supabase from "../lib/supabase";

function SyllabusGenerator() {
  const [className, setClassName] =
    useState("");

  const [subjectName, setSubjectName] =
    useState("");

  const generateTopics = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

   const { data, error } = await supabase
  .from("syllabus_topics")
  .select("*");

console.log("ALL DATA:", data);

    if (error) {
      alert(error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("No syllabus found");
      return;
    }

    const topicsToInsert =
      data.map((topic) => ({
        user_id: user.id,
        subject_name:
          subjectName,
        topic_name:
          topic.topic_name,
        is_completed: false,
      }));

    const { error: insertError } =
      await supabase
        .from("topics")
        .insert(topicsToInsert);

    if (insertError) {
      alert(insertError.message);
      return;
    }

    alert(
      `${topicsToInsert.length} topics generated`
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">
        Generate Learning Path
      </h2>

      <input
        placeholder="Class"
        value={className}
        onChange={(e) =>
          setClassName(e.target.value)
        }
        className="border p-2 rounded w-full mb-2"
      />

      <input
        placeholder="Subject"
        value={subjectName}
        onChange={(e) =>
          setSubjectName(
            e.target.value
          )
        }
        className="border p-2 rounded w-full mb-4"
      />

      <button
        onClick={generateTopics}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Generate Topics
      </button>
    </div>
  );
}

export default SyllabusGenerator;