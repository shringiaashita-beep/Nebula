import { useState, useEffect } from "react";
import { generateMysteryTopic } from "../lib/gemini";
import supabase from "../lib/supabase";

function SyllabusGenerator() {
  const [mysteryTopic, setMysteryTopic] = useState("");
  const [explanation, setExplanation] = useState("");
  const [challenge, setChallenge] = useState("");
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Failed to load subjects for syllabus generator:", error);
        return;
      }

      setSubjects(data || []);
      if (data && data.length > 0) {
        setSelectedSubject(data[0].name);
      } else {
        setSelectedSubject("Pharmacology");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const revealTopic = async () => {
    try {
      setLoading(true);
      const subjectToQuery = selectedSubject || "Pharmacology";
      const response = await generateMysteryTopic(subjectToQuery);

      const topicMatch = response.match(/TOPIC:\s*([\s\S]*?)EXPLANATION:/i);
      const explanationMatch = response.match(/EXPLANATION:\s*([\s\S]*?)CHALLENGE:/i);
      const challengeMatch = response.match(/CHALLENGE:\s*([\s\S]*)/i);

      setMysteryTopic(topicMatch?.[1]?.trim() || "");
      setExplanation(explanationMatch?.[1]?.trim() || "");
      setChallenge(challengeMatch?.[1]?.trim() || "");
    } catch (error) {
      console.error("Syllabus generation error:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="arc-card p-6 space-y-5" style={{ borderTop: "2px solid var(--arc-gold-500)" }}>
      {/* Header */}
      <div>
        <h2 className="arc-font-display text-2xl font-bold arc-text-gradient">🎁 Mystery Learning</h2>
        <p className="text-sm mt-1" style={{ color: "var(--arc-text-secondary)" }}>
          Discover a random topic and challenge yourself today.
        </p>
      </div>

      {/* Subject selector */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: "var(--arc-text-muted)" }}>
          Select Subject
        </label>
        {subjects.length > 0 ? (
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="arc-input w-full max-w-xs text-sm"
            style={{ background: "rgba(0,0,0,0.4)", colorScheme: "dark" }}
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.name} style={{ background: "#090A0F", color: "#fff" }}>
                {sub.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            placeholder="Enter subject (e.g. Pharmacology)"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="arc-input w-full max-w-xs text-sm"
            style={{ background: "rgba(0,0,0,0.4)" }}
          />
        )}
      </div>

      <button
        onClick={revealTopic}
        disabled={loading}
        className="arc-btn-gold px-6 py-2.5 text-sm rounded-xl"
      >
        {loading ? "Generating…" : "Reveal Topic"}
      </button>

      {/* Result card */}
      {mysteryTopic && (
        <div className="space-y-4">
          <div
            className="p-5 rounded-xl space-y-3"
            style={{
              background: "rgba(212,175,55,0.05)",
              border: "1px solid rgba(212,175,55,0.2)",
            }}
          >
            <p className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--arc-gold-400)" }}>
              ✨ Mystery Topic Found
            </p>
            <h3 className="arc-font-display text-xl font-bold arc-text-gradient">
              {mysteryTopic}
            </h3>

            <div>
              <h4 className="text-sm font-bold mb-1" style={{ color: "var(--arc-text-secondary)" }}>
                📖 Why It Matters
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: "var(--arc-text-secondary)" }}>
                {explanation}
              </p>
            </div>

            <div
              className="p-4 rounded-xl"
              style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--arc-border)" }}
            >
              <h4 className="text-sm font-bold mb-1" style={{ color: "var(--arc-text-secondary)" }}>
                🎯 Challenge
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: "var(--arc-text-secondary)" }}>
                {challenge}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}

export default SyllabusGenerator;

