import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { generateMindMap } from "../lib/gemini";

function MindMap({ subject, topic }) {
  const [mindmap, setMindmap] = useState("Loading...");

  useEffect(() => {
    fetchMindMap();
  }, [subject, topic]);

  const fetchMindMap = async () => {
    const { data, error } = await supabase
      .from("topic_mindmaps")
      .select("*");

    if (error) {
      setMindmap("Error loading mind map");
      return;
    }

    const match = data?.find(
      (item) =>
        item.subject_name === subject &&
        item.topic_name === topic
    );

    if (match) {
      setMindmap(match.mindmap);
    } else {
      try {
        setMindmap("Generating Mind Map...");
        const aiMindMap = await generateMindMap(subject, topic);
        const mapText = typeof aiMindMap === "string" ? aiMindMap : JSON.stringify(aiMindMap, null, 2);

        await supabase
          .from("topic_mindmaps")
          .insert([
            {
              subject_name: subject,
              topic_name: topic,
              mindmap: mapText,
            }
          ]);

        setMindmap(mapText);
      } catch (err) {
        console.error(err);
        setMindmap("No mind map available for this topic.");
      }
    }
  };

  // Helper to parse and render mindmap hierarchy beautifully
  const renderMindMapContent = () => {
    try {
      const parsed = JSON.parse(mindmap);
      if (parsed && parsed.branches) {
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide" style={{ background: "rgba(212,175,55,0.15)", color: "var(--arc-gold-400)" }}>
                Main Topic
              </span>
              <h4 className="text-base font-bold" style={{ color: "var(--arc-text-hero)" }}>
                {parsed.main_topic || topic}
              </h4>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {parsed.branches.map((branch, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border space-y-2"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderColor: "var(--arc-border)"
                  }}
                >
                  <h5 className="font-bold text-sm" style={{ color: "var(--arc-gold-400)" }}>
                    🌿 {branch.title}
                  </h5>
                  <ul className="list-disc pl-5 space-y-1 text-xs" style={{ color: "var(--arc-text-secondary)" }}>
                    {branch.points?.map((point, pIdx) => (
                      <li key={pIdx}>{point}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      }
    } catch (e) {
      // Fallback to text output if it's not a JSON structure
    }

    return (
      <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed" style={{ color: "var(--arc-text-secondary)" }}>
        {mindmap}
      </pre>
    );
  };

  return (
    <div
      className="border p-6 rounded-2xl mt-3"
      style={{
        background: "var(--arc-bg-surface)",
        borderColor: "var(--arc-border)",
        color: "var(--arc-text-primary)"
      }}
    >
      <h3 className="font-bold text-lg mb-4" style={{ color: "var(--arc-text-hero)" }}>
        🧠 Mind Map
      </h3>

      {renderMindMapContent()}
    </div>
  );
}

export default MindMap;