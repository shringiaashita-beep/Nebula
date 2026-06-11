import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

function MindMap({ subject, topic }) {
  const [mindmap, setMindmap] =
    useState("Loading...");

  useEffect(() => {
    fetchMindMap();
  }, [subject, topic]);

  const fetchMindMap = async () => {
    const { data, error } =
      await supabase
        .from("topic_mindmaps")
        .select("*");

    console.log(
      "ALL MINDMAPS:",
      data
    );
    console.log(
      "ERROR:",
      error
    );
    console.log(
      "SUBJECT:",
      subject
    );
    console.log(
      "TOPIC:",
      topic
    );

    if (error) {
      setMindmap(
        "Error loading mind map"
      );
      return;
    }

    const match =
      data?.find(
        (item) =>
          item.subject_name ===
            subject &&
          item.topic_name ===
            topic
      );

    console.log(
      "MATCH:",
      match
    );

    if (match) {
      setMindmap(
        match.mindmap
      );
    } else {
      setMindmap(
        "No mind map available for this topic."
      );
    }
  };

  return (
    <div className="bg-green-50 border p-4 rounded-lg mt-3">
      <h3 className="font-bold text-xl mb-2">
        🧠 Mind Map
      </h3>

      <pre className="whitespace-pre-wrap">
        {mindmap}
      </pre>
    </div>
  );
}

export default MindMap;